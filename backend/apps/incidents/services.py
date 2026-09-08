from apps.common.choices import IncidentStatus


class InvalidStatusTransitionError(Exception):
    def __init__(self, current_status: str, new_status: str):
        self.current_status = current_status
        self.new_status = new_status
        super().__init__(
            f"Cannot transition from {current_status} to {new_status}."
        )


ALLOWED_STATUS_TRANSITIONS: dict[str, set[str]] = {
    IncidentStatus.SUBMITTED: {IncidentStatus.UNDER_REVIEW},
    IncidentStatus.UNDER_REVIEW: {
        IncidentStatus.VERIFIED,
        IncidentStatus.REJECTED,
    },
    IncidentStatus.VERIFIED: {IncidentStatus.FORWARDED_TO_DEAN},
    IncidentStatus.FORWARDED_TO_DEAN: {IncidentStatus.ASSIGNED},
    IncidentStatus.ASSIGNED: {IncidentStatus.IN_PROGRESS},
    IncidentStatus.IN_PROGRESS: {IncidentStatus.RESOLVED},
    IncidentStatus.RESOLVED: {IncidentStatus.CLOSED, IncidentStatus.IN_PROGRESS},
    IncidentStatus.REJECTED: set(),
    IncidentStatus.CLOSED: set(),
}


def is_valid_status_transition(current_status: str, new_status: str) -> bool:
    allowed = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
    return new_status in allowed


def transition_incident(incident, new_status, *, verified_at=None, resolved_at=None, closed_at=None):
    if not is_valid_status_transition(incident.status, new_status):
        raise InvalidStatusTransitionError(incident.status, new_status)

    incident.status = new_status

    if verified_at is not None:
        incident.verified_at = verified_at
    if resolved_at is not None:
        incident.resolved_at = resolved_at
    if closed_at is not None:
        incident.closed_at = closed_at

    incident.save(
        update_fields=[
            "status",
            "verified_at",
            "resolved_at",
            "closed_at",
            "updated_at",
        ]
    )
    return incident


def admin_verify_and_forward(incident, *, verified_at):
    if incident.status == IncidentStatus.SUBMITTED:
        transition_incident(incident, IncidentStatus.UNDER_REVIEW)

    if incident.status == IncidentStatus.UNDER_REVIEW:
        transition_incident(incident, IncidentStatus.VERIFIED, verified_at=verified_at)

    if incident.status == IncidentStatus.VERIFIED:
        transition_incident(incident, IncidentStatus.FORWARDED_TO_DEAN)

    return incident


def admin_reject_incident(incident):
    if incident.status == IncidentStatus.SUBMITTED:
        transition_incident(incident, IncidentStatus.UNDER_REVIEW)

    if incident.status == IncidentStatus.UNDER_REVIEW:
        transition_incident(incident, IncidentStatus.REJECTED)

    return incident


def admin_request_more_information(incident):
    if incident.status == IncidentStatus.SUBMITTED:
        transition_incident(incident, IncidentStatus.UNDER_REVIEW)

    return incident


def official_start_progress(incident):
    transition_incident(incident, IncidentStatus.IN_PROGRESS)
    return incident


def official_resolve_incident(incident, *, resolved_at):
    transition_incident(incident, IncidentStatus.RESOLVED, resolved_at=resolved_at)
    return incident
