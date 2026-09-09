from django.conf import settings
from django.db import models

from apps.common.choices import MessageChannel


class Message(models.Model):
    incident = models.ForeignKey(
        "incidents.Incident",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="incident_messages",
    )
    content = models.TextField()
    channel = models.CharField(
        max_length=30,
        choices=MessageChannel.choices,
        default=MessageChannel.STUDENT_ADMIN,
    )
    is_internal = models.BooleanField(
        default=False,
        help_text="Internal messages are not visible on public incident views.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["incident", "created_at"]),
            models.Index(fields=["sender"]),
        ]

    def __str__(self):
        return f"Message on {self.incident.incident_number} by {self.sender.name}"
