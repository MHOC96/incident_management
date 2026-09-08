from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.assignments.models import ResponsibleParty
from apps.incidents.models import Category, Location

CATEGORIES = [
    ("Infrastructure", "Structural or facility infrastructure issues"),
    ("Maintenance", "General maintenance and repairs"),
    ("Water & Plumbing", "Leaks, taps, drainage, and plumbing issues"),
    ("Electrical", "Power, lighting, and electrical faults"),
    ("Cleanliness", "Cleaning and hygiene concerns"),
    ("Security", "Security-related incidents"),
    ("Student Conflict", "Student disputes requiring attention"),
    ("Academic", "Academic environment issues"),
    ("IT & Technology", "Computers, networks, and technology faults"),
    ("Safety", "Safety hazards and risk concerns"),
    ("Other", "Other university-related incidents"),
]

LOCATIONS = [
    ("Management Faculty", "Main Building", "Ground Floor"),
    ("Management Faculty", "Block A", "Ground Floor"),
    ("Management Faculty", "Block A", "First Floor"),
    ("Management Faculty", "Block B", "Ground Floor"),
    ("Management Faculty", "Block B", "Second Floor"),
    ("Management Faculty", "Lecture Theatre", "Ground Floor"),
    ("Management Faculty", "Computer Lab", "First Floor"),
    ("Management Faculty", "Common Area", "Ground Floor"),
    ("Management Faculty", "Restroom", "Ground Floor"),
    ("Management Faculty", "Parking Area", ""),
]

FACULTY_NAME = "Faculty of Management Studies and Commerce"

RESPONSIBLE_PARTIES = [
    ("Maintenance Division", "Handles maintenance and repair work"),
    ("Security Division", "Handles security-related incidents"),
    ("Heads of Department", "Department-level responsible officials"),
    ("Vice Chancellor's Office", "Senior university office oversight"),
    ("Other Authorized Officials", "Other authorized responsible offices"),
]


class Command(BaseCommand):
    help = "Seed incident categories and locations for the Management Faculty."

    def handle(self, *args, **options):
        category_count = 0
        location_count = 0
        party_count = 0

        for name, description in CATEGORIES:
            slug = slugify(name)
            _, created = Category.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": description,
                    "is_active": True,
                },
            )
            if created:
                category_count += 1

        for faculty, building, floor in LOCATIONS:
            name = building if not floor else f"{building} - {floor}"
            _, created = Location.objects.update_or_create(
                name=name,
                building=building,
                floor=floor,
                defaults={
                    "faculty": FACULTY_NAME,
                    "is_active": True,
                },
            )
            if created:
                location_count += 1

        for name, description in RESPONSIBLE_PARTIES:
            _, created = ResponsibleParty.objects.update_or_create(
                name=name,
                defaults={
                    "description": description,
                    "is_active": True,
                },
            )
            if created:
                party_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Reference data ready. Created "
                f"{category_count} categories, {location_count} locations, "
                f"and {party_count} responsible parties."
            )
        )
