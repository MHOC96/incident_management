from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User
from apps.common.choices import AccountStatus, UserRole

ALLOWED_ROLES = {UserRole.ADMIN, UserRole.DEAN}


class Command(BaseCommand):
    help = "Provision an Admin or Dean account through a controlled backend procedure."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--name", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument(
            "--role",
            required=True,
            choices=sorted(ALLOWED_ROLES),
            help="Only ADMIN or DEAN can be provisioned with this command.",
        )
        parser.add_argument("--phone", default="")
        parser.add_argument("--department", default="Faculty of Management Studies and Commerce")

    @transaction.atomic
    def handle(self, *args, **options):
        role = options["role"]
        email = options["email"].lower().strip()

        if role not in ALLOWED_ROLES:
            raise CommandError("Only ADMIN or DEAN accounts can be provisioned.")

        if User.objects.filter(email=email).exists():
            raise CommandError(f"A user with email {email} already exists.")

        user = User.objects.create_user(
            email=email,
            password=options["password"],
            name=options["name"],
            phone=options.get("phone", ""),
            role=role,
            status=AccountStatus.ACTIVE,
            department=options.get("department", ""),
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {role} account for {user.name} ({user.email})."
            )
        )
