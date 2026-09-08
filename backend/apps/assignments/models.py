from django.conf import settings
from django.db import models


class ResponsibleParty(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    officials = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="responsible_parties",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "responsible parties"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Assignment(models.Model):
    incident = models.ForeignKey(
        "incidents.Incident",
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    assigned_official = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="incident_assignments",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assignments_made",
    )
    responsible_party = models.ForeignKey(
        ResponsibleParty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assignments",
    )
    comment = models.TextField(blank=True)
    is_current = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-assigned_at"]
        indexes = [
            models.Index(fields=["incident", "is_current"]),
            models.Index(fields=["assigned_official"]),
            models.Index(fields=["assigned_at"]),
        ]

    def __str__(self):
        return f"{self.incident.incident_number} → {self.assigned_official.name}"
