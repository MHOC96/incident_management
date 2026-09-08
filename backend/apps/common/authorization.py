from apps.common.choices import IncidentStatus, UserRole


def user_can_view_incident(user, incident) -> bool:
    if not user or not user.is_authenticated:
        return False

    if user.role in {UserRole.ADMIN, UserRole.DEAN}:
        return True

    if incident.reporter_id == user.id:
        return True

    if user.role == UserRole.OFFICIAL:
        return incident.assignments.filter(
            assigned_official=user,
            is_current=True,
        ).exists()

    return False


def user_can_modify_incident(user, incident) -> bool:
    if not user or not user.is_authenticated:
        return False

    if user.role == UserRole.DEAN:
        return True

    if user.role == UserRole.STUDENT and incident.reporter_id == user.id:
        return incident.status == IncidentStatus.SUBMITTED

    if user.role == UserRole.OFFICIAL:
        return incident.assignments.filter(
            assigned_official=user,
            is_current=True,
        ).exists()

    return False


def user_can_admin_review_incident(user, incident) -> bool:
    return (
        user
        and user.is_authenticated
        and user.role == UserRole.ADMIN
        and incident.status in {
            IncidentStatus.SUBMITTED,
            IncidentStatus.UNDER_REVIEW,
        }
    )


def user_can_verify_incident(user, incident) -> bool:
    return user_can_admin_review_incident(user, incident)


def user_can_assign_incident(user, incident) -> bool:
    return (
        user
        and user.is_authenticated
        and user.role == UserRole.DEAN
        and incident.status
        in {
            IncidentStatus.FORWARDED_TO_DEAN,
            IncidentStatus.ASSIGNED,
            IncidentStatus.IN_PROGRESS,
        }
    )


def user_can_start_progress_incident(user, incident) -> bool:
    if not user or not user.is_authenticated or user.role != UserRole.OFFICIAL:
        return False

    return incident.assignments.filter(
        assigned_official=user,
        is_current=True,
    ).exists() and incident.status == IncidentStatus.ASSIGNED


def user_can_resolve_incident(user, incident) -> bool:
    if not user or not user.is_authenticated or user.role != UserRole.OFFICIAL:
        return False

    return incident.assignments.filter(
        assigned_official=user,
        is_current=True,
    ).exists() and incident.status in {
        IncidentStatus.ASSIGNED,
        IncidentStatus.IN_PROGRESS,
    }


def user_can_close_incident(user, incident) -> bool:
    return (
        user
        and user.is_authenticated
        and user.role == UserRole.DEAN
        and incident.status == IncidentStatus.RESOLVED
    )


def user_can_reopen_incident(user, incident) -> bool:
    return (
        user
        and user.is_authenticated
        and user.role == UserRole.DEAN
        and incident.status == IncidentStatus.RESOLVED
    )


def user_can_message_on_incident(user, incident) -> bool:
    if not user_can_view_incident(user, incident):
        return False

    if user.role == UserRole.STUDENT:
        return incident.reporter_id == user.id

    return user.role in {UserRole.ADMIN, UserRole.DEAN, UserRole.OFFICIAL}
