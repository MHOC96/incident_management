from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.assignments.services import assign_incident
from apps.common.choices import IncidentStatus, MessageChannel, UserRole
from apps.communications.models import Message
from apps.incidents.models import Category, Incident, Location

User = get_user_model()


class MessageChannelTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email="student@usj.lk",
            password="testpass123",
            name="Test Student",
            role=UserRole.STUDENT,
        )
        self.other_student = User.objects.create_user(
            email="other@usj.lk",
            password="testpass123",
            name="Other Student",
            role=UserRole.STUDENT,
        )
        self.admin = User.objects.create_user(
            email="admin@usj.lk",
            password="testpass123",
            name="Test Admin",
            role=UserRole.ADMIN,
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
        category = Category.objects.create(name="Maintenance", slug="maintenance")
        location = Location.objects.create(name="Block B")
        self.incident = Incident.objects.create(
            incident_number="INC-2026-00030",
            title="Broken window",
            description="Window is cracked",
            category=category,
            location=location,
            reporter=self.student,
            status=IncidentStatus.SUBMITTED,
        )

    def test_other_student_cannot_access_incident_messages(self):
        Message.objects.create(
            incident=self.incident,
            sender=self.admin,
            content="Admin note",
            channel=MessageChannel.STUDENT_ADMIN,
        )
        self.client.force_authenticate(user=self.other_student)
        response = self.client.get(f"/api/incidents/{self.incident.id}/messages/")
        self.assertEqual(response.status_code, 404)

    def test_student_only_sees_admin_channel_before_verification(self):
        Message.objects.create(
            incident=self.incident,
            sender=self.admin,
            content="Admin note",
            channel=MessageChannel.STUDENT_ADMIN,
        )
        Message.objects.create(
            incident=self.incident,
            sender=self.dean,
            content="Dean note",
            channel=MessageChannel.STUDENT_DEAN,
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/incidents/{self.incident.id}/messages/")
        self.assertEqual(response.status_code, 200)
        channels = {item["channel"] for item in response.json()["results"]}
        self.assertEqual(channels, {MessageChannel.STUDENT_ADMIN})

    def test_admin_only_has_student_admin_channel(self):
        self.incident.status = IncidentStatus.VERIFIED
        self.incident.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Dean context", "channel": MessageChannel.STUDENT_DEAN},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Please clarify", "channel": MessageChannel.STUDENT_ADMIN},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_dean_can_chat_in_admin_and_official_channels(self):
        self.incident.status = IncidentStatus.FORWARDED_TO_DEAN
        self.incident.save(update_fields=["status", "updated_at"])
        assign_incident(
            self.incident,
            assigned_official=self.official,
            assigned_by=self.dean,
        )

        self.client.force_authenticate(user=self.dean)
        for channel in (
            MessageChannel.STUDENT_ADMIN,
            MessageChannel.STUDENT_DEAN,
            MessageChannel.STUDENT_OFFICIAL,
        ):
            response = self.client.post(
                f"/api/incidents/{self.incident.id}/messages/",
                {"content": f"Dean message in {channel}", "channel": channel},
                format="json",
            )
            self.assertEqual(response.status_code, 201)

    def test_official_can_chat_with_student_and_dean_channels(self):
        self.incident.status = IncidentStatus.FORWARDED_TO_DEAN
        self.incident.save(update_fields=["status", "updated_at"])
        assign_incident(
            self.incident,
            assigned_official=self.official,
            assigned_by=self.dean,
        )

        self.client.force_authenticate(user=self.official)
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Need dean input", "channel": MessageChannel.STUDENT_DEAN},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Technician scheduled", "channel": MessageChannel.STUDENT_OFFICIAL},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {"content": "Admin note", "channel": MessageChannel.STUDENT_ADMIN},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_internal_messages_are_not_supported(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/messages/",
            {
                "content": "Hidden note",
                "channel": MessageChannel.STAFF_INTERNAL,
                "is_internal": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
