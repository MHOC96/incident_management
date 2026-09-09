from apps.common.authorization import user_can_view_incident
from apps.common.choices import AccountStatus, IncidentStatus, MessageChannel, UserRole

POST_VERIFICATION_STATUSES = {
    IncidentStatus.VERIFIED,
    IncidentStatus.FORWARDED_TO_DEAN,
    IncidentStatus.ASSIGNED,
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.RESOLVED,
    IncidentStatus.CLOSED,
}

ASSIGNED_STATUSES = {
    IncidentStatus.ASSIGNED,
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.RESOLVED,
    IncidentStatus.CLOSED,
}


def incident_has_assigned_official(incident) -> bool:
    return incident.assignments.filter(is_current=True).exists()


def get_assigned_official_id(incident):
    assignment = incident.assignments.filter(is_current=True).only(
        "assigned_official_id"
    ).first()
    return assignment.assigned_official_id if assignment else None


def active_user_ids_for_roles(*roles):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    return set(
        User.objects.filter(
            role__in=roles,
            status=AccountStatus.ACTIVE,
            is_active=True,
        ).values_list("id", flat=True)
    )


def unlocked_channels_for_incident(incident) -> set[str]:
    channels = {MessageChannel.STUDENT_ADMIN}

    if incident.status in POST_VERIFICATION_STATUSES:
        channels.add(MessageChannel.STUDENT_DEAN)

    if incident.status in ASSIGNED_STATUSES and incident_has_assigned_official(incident):
        channels.add(MessageChannel.STUDENT_OFFICIAL)

    return channels


def visible_channels_for_user(user, incident):
    if not user_can_view_incident(user, incident):
        return set()

    unlocked = unlocked_channels_for_incident(incident)

    if user.role == UserRole.STUDENT:
        return unlocked

    if user.role == UserRole.ADMIN:
        if MessageChannel.STUDENT_ADMIN in unlocked:
            return {MessageChannel.STUDENT_ADMIN}
        return set()

    if user.role == UserRole.DEAN:
        return unlocked

    if user.role == UserRole.OFFICIAL:
        channels = set()
        if MessageChannel.STUDENT_DEAN in unlocked:
            channels.add(MessageChannel.STUDENT_DEAN)
        if MessageChannel.STUDENT_OFFICIAL in unlocked:
            channels.add(MessageChannel.STUDENT_OFFICIAL)
        return channels

    return set()


def writable_channels_for_user(user, incident):
    return visible_channels_for_user(user, incident)


def user_can_access_channel(user, incident, channel) -> bool:
    return channel in visible_channels_for_user(user, incident)


def user_can_write_channel(user, incident, channel) -> bool:
    return channel in writable_channels_for_user(user, incident)


def default_channel_for_user(user, incident) -> str:
    writable = writable_channels_for_user(user, incident)
    if not writable:
        return MessageChannel.STUDENT_ADMIN

    if user.role == UserRole.STUDENT:
        if MessageChannel.STUDENT_OFFICIAL in writable:
            return MessageChannel.STUDENT_OFFICIAL
        if MessageChannel.STUDENT_DEAN in writable:
            return MessageChannel.STUDENT_DEAN
        return MessageChannel.STUDENT_ADMIN

    if user.role == UserRole.ADMIN:
        return MessageChannel.STUDENT_ADMIN

    if user.role == UserRole.DEAN:
        if MessageChannel.STUDENT_ADMIN in writable:
            return MessageChannel.STUDENT_ADMIN
        if MessageChannel.STUDENT_DEAN in writable:
            return MessageChannel.STUDENT_DEAN
        return MessageChannel.STUDENT_OFFICIAL

    if user.role == UserRole.OFFICIAL:
        if MessageChannel.STUDENT_OFFICIAL in writable:
            return MessageChannel.STUDENT_OFFICIAL
        return MessageChannel.STUDENT_DEAN

    return MessageChannel.STUDENT_ADMIN


def resolve_message_channel(*, user, incident, channel=None, is_internal=False) -> str:
    if is_internal or channel == MessageChannel.STAFF_INTERNAL:
        raise ValueError("Internal staff messages are not supported.")

    resolved = channel or default_channel_for_user(user, incident)
    if resolved not in unlocked_channels_for_incident(incident):
        raise ValueError("This communication channel is not available for the incident yet.")

    return resolved


def channel_recipient_ids(incident, channel, sender_id):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    recipient_ids = set()
    sender_role = User.objects.filter(pk=sender_id).values_list("role", flat=True).first()
    assigned_official_id = get_assigned_official_id(incident)
    admin_ids = active_user_ids_for_roles(UserRole.ADMIN)
    dean_ids = active_user_ids_for_roles(UserRole.DEAN)

    if channel == MessageChannel.STUDENT_ADMIN:
        if sender_id == incident.reporter_id:
            recipient_ids.update(admin_ids)
            recipient_ids.update(dean_ids)
        elif sender_role == UserRole.ADMIN:
            recipient_ids.add(incident.reporter_id)
            recipient_ids.update(dean_ids)
        elif sender_role == UserRole.DEAN:
            recipient_ids.add(incident.reporter_id)
            recipient_ids.update(admin_ids)

    elif channel == MessageChannel.STUDENT_DEAN:
        if sender_id == incident.reporter_id:
            recipient_ids.update(dean_ids)
            if assigned_official_id:
                recipient_ids.add(assigned_official_id)
        elif sender_role == UserRole.DEAN:
            recipient_ids.add(incident.reporter_id)
            if assigned_official_id:
                recipient_ids.add(assigned_official_id)
        elif sender_role == UserRole.OFFICIAL:
            recipient_ids.add(incident.reporter_id)
            recipient_ids.update(dean_ids)

    elif channel == MessageChannel.STUDENT_OFFICIAL:
        if not assigned_official_id:
            return recipient_ids
        if sender_id == incident.reporter_id:
            recipient_ids.add(assigned_official_id)
            recipient_ids.update(dean_ids)
        elif sender_role == UserRole.OFFICIAL:
            recipient_ids.add(incident.reporter_id)
            recipient_ids.update(dean_ids)
        elif sender_role == UserRole.DEAN:
            recipient_ids.add(incident.reporter_id)
            recipient_ids.add(assigned_official_id)

    recipient_ids.discard(sender_id)
    return recipient_ids
