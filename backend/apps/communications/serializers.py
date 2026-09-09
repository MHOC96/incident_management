from rest_framework import serializers

from apps.communications.channel_access import (
    resolve_message_channel,
    user_can_write_channel,
)
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
            "channel",
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

    def validate(self, attrs):
        request = self.context.get("request")
        incident = self.context.get("incident")
        user = getattr(request, "user", None)
        if not user or not incident:
            return attrs

        if attrs.get("is_internal"):
            raise serializers.ValidationError(
                {"is_internal": "Internal staff messages are not supported."}
            )

        try:
            channel = resolve_message_channel(
                user=user,
                incident=incident,
                channel=attrs.get("channel"),
            )
        except ValueError as exc:
            raise serializers.ValidationError({"channel": str(exc)}) from exc

        if not user_can_write_channel(user, incident, channel):
            raise serializers.ValidationError(
                {"channel": "You are not authorized to post in this communication channel."}
            )

        attrs["channel"] = channel
        attrs["is_internal"] = False
        return attrs
