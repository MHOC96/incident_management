from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.common.choices import IncidentStatus, UserRole
from apps.common.authorization import user_can_admin_review_incident, user_can_close_incident
from apps.incidents.models import Category, Incident, Location
from apps.incidents.services import admin_verify_and_forward
from apps.notifications.models import Notification

User = get_user_model()


class PermissionFoundationTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email="student@usj.lk",
            password="testpass123",
            name="Test Student",
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
        category = Category.objects.create(name="Maintenance", slug="maintenance")
        location = Location.objects.create(name="Block B")
        self.incident = Incident.objects.create(
            incident_number="INC-2026-00001",
            title="Broken door",
            description="Door is damaged",
            category=category,
            location=location,
            reporter=self.student,
            status=IncidentStatus.UNDER_REVIEW,
        )

    def test_student_cannot_review_incident(self):
        self.assertFalse(user_can_admin_review_incident(self.student, self.incident))

    def test_admin_can_review_submitted_incident(self):
        self.incident.status = IncidentStatus.SUBMITTED
        self.assertTrue(user_can_admin_review_incident(self.admin, self.incident))

    def test_admin_can_review_under_review_incident(self):
        self.assertTrue(user_can_admin_review_incident(self.admin, self.incident))

    def test_student_cannot_close_incident(self):
        self.incident.status = IncidentStatus.RESOLVED
        self.assertFalse(user_can_close_incident(self.student, self.incident))

    def test_dean_can_close_resolved_incident(self):
        self.incident.status = IncidentStatus.RESOLVED
        self.assertTrue(user_can_close_incident(self.dean, self.incident))


class AdminReviewFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email="student@usj.lk",
            password="testpass123",
            name="Test Student",
            role=UserRole.STUDENT,
        )
        self.admin = User.objects.create_user(
            email="admin@usj.lk",
            password="testpass123",
            name="Test Admin",
            role=UserRole.ADMIN,
        )
        category = Category.objects.create(name="Maintenance", slug="maintenance")
        location = Location.objects.create(name="Block B")
        self.incident = Incident.objects.create(
            incident_number="INC-2026-00002",
            title="Broken tap",
            description="Tap is leaking",
            category=category,
            location=location,
            reporter=self.student,
            status=IncidentStatus.SUBMITTED,
        )
        self.client.force_authenticate(user=self.admin)

    def test_verify_forwards_incident_to_dean(self):
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/verify/",
            {"comment": "Verified for action."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, IncidentStatus.FORWARDED_TO_DEAN)
        self.assertIsNotNone(self.incident.verified_at)
        self.assertTrue(
            Notification.objects.filter(
                user=self.student,
                related_incident=self.incident,
            ).exists()
        )

    def test_reject_requires_comment(self):
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/reject/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_reject_marks_incident_rejected(self):
        response = self.client.post(
            f"/api/incidents/{self.incident.id}/reject/",
            {"comment": "Insufficient evidence provided."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, IncidentStatus.REJECTED)

    def test_pending_review_lists_submitted_incidents(self):
        response = self.client.get("/api/incidents/pending-review/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_admin_verify_service_chain(self):
        admin_verify_and_forward(self.incident, verified_at=timezone.now())
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, IncidentStatus.FORWARDED_TO_DEAN)


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_student_registration_assigns_student_role(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "name": "Bad Actor",
                "email": "bad@usj.lk",
                "phone": "0770000000",
                "mc_number": "MC123",
                "password": "securepass1",
                "password_confirm": "securepass1",
                "department": "Commerce",
                "year": 2,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="bad@usj.lk")
        self.assertEqual(user.role, UserRole.STUDENT)
