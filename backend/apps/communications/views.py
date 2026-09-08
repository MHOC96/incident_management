from rest_framework import permissions, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.throttling import UserRateThrottle

from apps.common.authorization import user_can_message_on_incident, user_can_view_incident
from apps.common.choices import UserRole
from apps.common.permissions import IsActiveUser
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
            incident = Incident.objects.select_related("reporter").get(
                pk=self.kwargs["incident_pk"]
            )
        except Incident.DoesNotExist as exc:
            raise NotFound() from exc

        if not user_can_view_incident(self.request.user, incident):
            raise NotFound()

        self._incident = incident
        return incident

    def get_queryset(self):
        incident = self.get_incident()
        queryset = Message.objects.filter(incident=incident).select_related("sender")
        if self.request.user.is_student:
            return queryset.filter(is_internal=False)
        return queryset

    def perform_create(self, serializer):
        incident = self.get_incident()
        user = self.request.user
        if not user_can_message_on_incident(user, incident):
            raise permissions.PermissionDenied("Not authorized to message on this incident.")

        is_internal = serializer.validated_data.get("is_internal", False)
        if user.role not in {UserRole.ADMIN, UserRole.DEAN}:
            is_internal = False

        message = serializer.save(
            incident=incident,
            sender=user,
            is_internal=is_internal,
        )
        notify_message_participants(
            incident=incident,
            sender=user,
            content=message.content,
            is_internal=is_internal,
        )
