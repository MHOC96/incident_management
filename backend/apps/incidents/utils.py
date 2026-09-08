from datetime import datetime

from django.db import transaction

from apps.incidents.models import Incident


def generate_incident_number() -> str:
    year = datetime.now().year
    prefix = f"INC-{year}-"

    with transaction.atomic():
        last_incident = (
            Incident.objects.select_for_update()
            .filter(incident_number__startswith=prefix)
            .order_by("-incident_number")
            .first()
        )

        if last_incident:
            last_sequence = int(last_incident.incident_number.split("-")[-1])
            next_sequence = last_sequence + 1
        else:
            next_sequence = 1

    return f"{prefix}{next_sequence:05d}"
