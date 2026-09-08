from rest_framework import serializers

from apps.common.choices import UserRole
from apps.communications.models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.name", read_only=True)
    sender_role = serializers.CharField(source="sender.role", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "incident",
            "sender",
            "sender_name",
            "sender_role",
            "content",
            "is_internal",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "incident",
            "sender",
            "sender_name",
            "sender_role",
            "created_at",
        ]

    def validate_is_internal(self, value):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "role", None) not in {UserRole.ADMIN, UserRole.DEAN}:
            return False
        return value
