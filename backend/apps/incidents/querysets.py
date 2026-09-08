from django.db.models import Prefetch

from apps.assignments.models import Assignment
from apps.common.choices import IncidentStatus, IncidentVisibility
from apps.incidents.models import Incident

PUBLIC_VISIBLE_STATUSES = (
    IncidentStatus.VERIFIED,
    IncidentStatus.FORWARDED_TO_DEAN,
    IncidentStatus.ASSIGNED,
    IncidentStatus.IN_PROGRESS,
    IncidentStatus.RESOLVED,
    IncidentStatus.CLOSED,
)

CURRENT_ASSIGNMENT_PREFETCH = Prefetch(
    "assignments",
    queryset=Assignment.objects.filter(is_current=True).select_related(
        "assigned_official",
        "assigned_by",
        "responsible_party",
    ),
    to_attr="prefetched_current_assignments",
)


def optimized_incident_queryset():
    return Incident.objects.select_related(
        "category",
        "location",
        "reporter",
    ).prefetch_related(
        "images",
        CURRENT_ASSIGNMENT_PREFETCH,
    )


def public_incident_queryset():
    return Incident.objects.filter(
        visibility=IncidentVisibility.PUBLIC,
        status__in=PUBLIC_VISIBLE_STATUSES,
    ).select_related("category", "location").prefetch_related("images")
