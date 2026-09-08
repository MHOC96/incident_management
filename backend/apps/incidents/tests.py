from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.assignments.services import assign_incident
from apps.common.authorization import (
    user_can_resolve_incident,
    user_can_start_progress_incident,
)
from apps.common.choices import IncidentStatus, UserRole
from apps.incidents.models import Category, Incident, Location
from apps.notifications.models import Notification

User = get_user_model()


class OfficialFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email="student@usj.lk",
            password="testpass123",
            name="Test Student",
            role=UserRole.STUDENT,
        )
        self.dean = User.objects.create_user(
            email="dean@usj.lk",
            password="testpass123",
            name="Test Dean",
            role=UserRole.DEAN,
        )
        self.official = User.objects.create_user(
            email="official@usj.lk",
            password="testpass123",
            name="Test Official",
            role=UserRole.OFFICIAL,
        )
        self.other_official = User.objects.create_user(
            email="other-official@usj.lk",
            password="testpass123",
            name="Other Official",
            role=UserRole.OFFICIAL,
        )
        category = Category.objects.create(name="Maintenance", slug="maintenance")
        location = Location.objects.create(name="Block B")
        self.incident = Incident.objects.create(
            incident_number="INC-2026-00010",
            title="Broken door",
            description="Door is damaged",
            category=category,
            location=location,
            reporter=self.student,
            status=IncidentStatus.FORWARDED_TO_DEAN,
        )
        assign_incident(
            self.incident,
            assigned_official=self.official,
            assigned_by=self.dean,
            comment="Please inspect and repair.",
        )
        self.incident.refresh_from_db()
        self.client.force_authenticate(user=self.official)

    def test_official_can_start_progress(self):
        self.assertTrue(user_can_start_progress_incident(self.official, self.incident))
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/start-progress/",
            {"comment": "Technician dispatched."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, IncidentStatus.IN_PROGRESS)
        self.assertTrue(
            Notification.objects.filter(
                user=self.student,
                related_incident=self.incident,
            ).exists()
        )

    def test_other_official_cannot_start_progress(self):
        self.client.force_authenticate(user=self.other_official)
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/start-progress/",
            {"comment": "Attempting unauthorized start."},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_official_can_resolve_in_progress_incident(self):
        self.incident.status = IncidentStatus.IN_PROGRESS
        self.incident.save(update_fields=["status", "updated_at"])
        self.assertTrue(user_can_resolve_incident(self.official, self.incident))

        response = self.client.post(
            f"/api/incidents/{self.incident.id}/resolve/",
            {"comment": "Door has been repaired successfully."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, IncidentStatus.RESOLVED)
        self.assertIsNotNone(self.incident.resolved_at)
        self.assertTrue(
            Notification.objects.filter(
                user=self.dean,
                related_incident=self.incident,
            ).exists()
        )

    def test_resolve_requires_comment(self):
        self.incident.status = IncidentStatus.IN_PROGRESS
        self.incident.save(update_fields=["status", "updated_at"])
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/resolve/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_assigned_list_returns_only_official_incidents(self):
        other_incident = Incident.objects.create(
            incident_number="INC-2026-00011",
            title="Other issue",
            description="Not assigned to test official",
            category=self.incident.category,
            location=self.incident.location,
            reporter=self.student,
            status=IncidentStatus.FORWARDED_TO_DEAN,
        )
        assign_incident(
            other_incident,
            assigned_official=self.other_official,
            assigned_by=self.dean,
        )

        response = self.client.get("/api/incidents/assigned/")
        self.assertEqual(response.status_code, 200)
        incident_ids = [item["id"] for item in response.json()["results"]]
        self.assertIn(self.incident.id, incident_ids)
        self.assertNotIn(other_incident.id, incident_ids)

    def test_official_stats(self):
        self.incident.status = IncidentStatus.IN_PROGRESS
        self.incident.save(update_fields=["status", "updated_at"])
        response = self.client.get("/api/incidents/official-stats/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["in_progress"], 1)
        self.assertEqual(data["total_assigned"], 1)

    def test_official_can_message_on_assigned_incident(self):
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Inspection scheduled for tomorrow."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_student_cannot_resolve_incident(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/resolve/",
            {"comment": "Student should not resolve this incident."},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
