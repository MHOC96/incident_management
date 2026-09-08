from rest_framework import permissions, viewsets
from rest_framework.throttling import UserRateThrottle

from apps.common.authorization import user_can_message_on_incident
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
        return Incident.objects.get(pk=self.kwargs["incident_pk"])

    def get_queryset(self):
        incident = self.get_incident()
        user = self.request.user
        queryset = Message.objects.filter(incident=incident).select_related("sender")

        if not user_can_message_on_incident(user, incident):
            return Message.objects.none()

        if user.is_student:
            return queryset.filter(is_internal=False)

        return queryset

    def perform_create(self, serializer):
        incident = self.get_incident()
        if not user_can_message_on_incident(self.request.user, incident):
            raise permissions.PermissionDenied("Not authorized to message on this incident.")
        message = serializer.save(incident=incident, sender=self.request.user)
        notify_message_participants(
            incident=incident,
            sender=self.request.user,
            content=message.content,
        )
