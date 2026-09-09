from rest_framework import permissions, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.throttling import UserRateThrottle

from apps.common.authorization import user_can_message_on_incident, user_can_view_incident
from apps.common.choices import MessageChannel, UserRole
from apps.common.permissions import IsActiveUser
from apps.communications.channel_access import (
    user_can_access_channel,
    visible_channels_for_user,
)
from apps.communications.models import Message
from apps.communications.serializers import MessageSerializer
from apps.incidents.models import Incident
from apps.notifications.services import notify_message_participants


class CommunicationThrottle(UserRateThrottle):
    scope = "communication"


class IncidentMessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsActiveUser]
    throttle_classes = [CommunicationThrottle]
    http_method_names = ["get", "post", "head", "options"]

    def get_incident(self):
        if hasattr(self, "_incident"):
            return self._incident

        try:
            incident = Incident.objects.select_related("reporter").prefetch_related(
                "assignments"
            ).get(pk=self.kwargs["incident_pk"])
        except Incident.DoesNotExist as exc:
            raise NotFound() from exc

        if not user_can_view_incident(self.request.user, incident):
            raise NotFound()

        self._incident = incident
        return incident

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["incident"] = self.get_incident()
        return context

    def get_queryset(self):
        incident = self.get_incident()
        user = self.request.user
        allowed_channels = visible_channels_for_user(user, incident)
        queryset = Message.objects.filter(
            incident=incident,
            channel__in=allowed_channels,
        ).select_related("sender")

        channel = self.request.query_params.get("channel")
        if channel:
            if channel not in allowed_channels:
                raise ValidationError({"channel": "Invalid communication channel."})
            queryset = queryset.filter(channel=channel)

        return queryset

    def perform_create(self, serializer):
        incident = self.get_incident()
        user = self.request.user
        if not user_can_message_on_incident(user, incident):
            raise permissions.PermissionDenied("Not authorized to message on this incident.")

        channel = serializer.validated_data["channel"]
        if not user_can_access_channel(user, incident, channel):
            raise permissions.PermissionDenied("Not authorized for this communication channel.")

        message = serializer.save(
            incident=incident,
            sender=user,
        )
        notify_message_participants(
            incident=incident,
            sender=user,
            content=message.content,
            channel=message.channel,
        )
