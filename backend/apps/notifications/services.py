from django.contrib.auth import get_user_model

from apps.common.choices import AccountStatus, NotificationType, UserRole
from apps.notifications.models import Notification

User = get_user_model()


def notify_user(*, user, title, message, notification_type, related_incident=None):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_incident=related_incident,
    )


def notify_admins_of_submission(incident):
    admins = User.objects.filter(role=UserRole.ADMIN, status=AccountStatus.ACTIVE)
    Notification.objects.bulk_create(
        [
            Notification(
                user=admin,
                title="New incident submitted",
                message=f"{incident.incident_number}: {incident.title}",
                notification_type=NotificationType.INCIDENT_SUBMITTED,
                related_incident=incident,
            )
            for admin in admins
        ]
    )


def notify_message_participants(*, incident, sender, content, is_internal=False):
    recipient_ids = set()

    if not is_internal and incident.reporter_id != sender.id:
        recipient_ids.add(incident.reporter_id)

    assignment = incident.assignments.filter(is_current=True).only(
        "assigned_official_id"
    ).first()
    if assignment and assignment.assigned_official_id != sender.id:
        recipient_ids.add(assignment.assigned_official_id)

    if not recipient_ids:
        return

    preview = content.strip()
    if len(preview) > 80:
        preview = f"{preview[:77]}..."

    recipients = User.objects.filter(
        id__in=recipient_ids,
        status=AccountStatus.ACTIVE,
        is_active=True,
    )
    Notification.objects.bulk_create(
        [
            Notification(
                user=recipient,
                title="New incident message",
                message=f"{incident.incident_number}: {preview}",
                notification_type=NotificationType.NEW_MESSAGE,
                related_incident=incident,
            )
            for recipient in recipients
        ]
    )
