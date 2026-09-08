from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "related_incident",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "related_incident",
            "created_at",
        ]


class NotificationMarkReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["is_read"]
