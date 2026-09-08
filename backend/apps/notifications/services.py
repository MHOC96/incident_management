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
    for admin in admins:
        notify_user(
            user=admin,
            title="New incident submitted",
            message=f"{incident.incident_number}: {incident.title}",
            notification_type=NotificationType.INCIDENT_SUBMITTED,
            related_incident=incident,
        )


def notify_message_participants(*, incident, sender, content):
    recipients = []

    if incident.reporter_id != sender.id:
        recipients.append(incident.reporter)

    assignment = incident.assignments.filter(is_current=True).select_related(
        "assigned_official"
    ).first()
    if assignment and assignment.assigned_official_id != sender.id:
        recipients.append(assignment.assigned_official)

    preview = content.strip()
    if len(preview) > 80:
        preview = f"{preview[:77]}..."

    for recipient in recipients:
        notify_user(
            user=recipient,
            title="New incident message",
            message=f"{incident.incident_number}: {preview}",
            notification_type=NotificationType.NEW_MESSAGE,
            related_incident=incident,
        )
