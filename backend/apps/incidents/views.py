from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from apps.assignments.services import (
    assign_incident,
    close_incident,
    resolve_assigned_incident,
    start_incident_progress,
)
from apps.common.authorization import (
    user_can_admin_review_incident,
    user_can_assign_incident,
    user_can_close_incident,
    user_can_modify_incident,
    user_can_reopen_incident,
    user_can_resolve_incident,
    user_can_start_progress_incident,
    user_can_verify_incident,
)
from apps.common.choices import IncidentStatus, MessageChannel, NotificationType, UserRole
from apps.common.permissions import IsActiveUser, IsAdmin, IsDean, IsOfficial, IsStaffRole, IsStudent
from apps.communications.models import Message
from apps.incidents.cloudinary_service import upload_incident_image
from apps.incidents.models import Category, Incident, IncidentImage, Location
from apps.incidents.permissions import IncidentObjectPermission
from apps.incidents.serializers import (
    CategorySerializer,
    IncidentActionSerializer,
    IncidentAdminReviewSerializer,
    IncidentAssignSerializer,
    IncidentCreateSerializer,
    IncidentDeanDetailSerializer,
    IncidentDetailSerializer,
    IncidentImageSerializer,
    IncidentOfficialDetailSerializer,
    IncidentPriorityUpdateSerializer,
    IncidentRejectSerializer,
    IncidentRequestInfoSerializer,
    IncidentResolveSerializer,
    IncidentStudentDetailSerializer,
    LocationSerializer,
    PublicIncidentSerializer,
)
from apps.incidents.services import (
    InvalidStatusTransitionError,
    admin_reject_incident,
    admin_request_more_information,
    admin_verify_and_forward,
    is_valid_status_transition,
    transition_incident,
)
from apps.incidents.querysets import (
    optimized_incident_queryset,
    public_incident_queryset,
)
from apps.incidents.utils import generate_incident_number
from apps.notifications.models import Notification
from apps.notifications.services import notify_admins_of_submission

PENDING_REVIEW_STATUSES = {
    IncidentStatus.SUBMITTED,
    IncidentStatus.UNDER_REVIEW,
}


class IncidentCreateThrottle(UserRateThrottle):
    scope = "incident_create"


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class LocationListView(generics.ListAPIView):
    queryset = Location.objects.filter(is_active=True)
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class IncidentViewSet(viewsets.ModelViewSet):
    http_method_names = ["get", "post", "patch", "head", "options"]
    permission_classes = [IsActiveUser, IncidentObjectPermission]

    def get_throttles(self):
        if self.action == "create":
            return [IncidentCreateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return public_incident_queryset()

        queryset = optimized_incident_queryset()

        if user.role in {UserRole.ADMIN, UserRole.DEAN}:
            return queryset

        if user.role == UserRole.OFFICIAL:
            return queryset.filter(
                assignments__assigned_official=user,
                assignments__is_current=True,
            ).distinct()

        return queryset.filter(reporter=user)

    def get_serializer_class(self):
        if self.action == "create":
            return IncidentCreateSerializer
        if self.action in {"list_public", "retrieve_public"}:
            return PublicIncidentSerializer
        if self.action in {"retrieve", "pending_review"} and self.request.user.role == UserRole.ADMIN:
            return IncidentAdminReviewSerializer
        if self.request.user.is_authenticated and self.request.user.role == UserRole.ADMIN:
            if self.action in {"verify", "reject", "request_info"}:
                return IncidentAdminReviewSerializer
        return IncidentDetailSerializer

    def get_permissions(self):
        if self.action in {"list_public", "retrieve_public"}:
            return [permissions.AllowAny()]
        if self.action == "create":
            return [IsStudent()]
        if self.action in {"pending_review", "review_stats"}:
            return [IsAdmin()]
        if self.action in {
            "dean_stats",
            "awaiting_action",
            "currently_underway",
            "resolved_awaiting_closure",
            "reopen",
        }:
            return [IsDean()]
        if self.action in {"assigned", "official_stats"}:
            return [IsOfficial()]
        if self.action in {"start_progress", "resolve"}:
            return [IsOfficial()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        incident = self.get_object()
        if request.user.role == UserRole.ADMIN:
            serializer = IncidentAdminReviewSerializer(incident)
        elif request.user.role == UserRole.DEAN:
            serializer = IncidentDeanDetailSerializer(incident)
        elif request.user.role == UserRole.OFFICIAL:
            serializer = IncidentOfficialDetailSerializer(incident)
        elif request.user.role == UserRole.STUDENT:
            serializer = IncidentStudentDetailSerializer(incident)
        else:
            serializer = IncidentDetailSerializer(incident)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        incident = self.get_object()
        if request.user.role != UserRole.DEAN:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentPriorityUpdateSerializer(
            incident,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(IncidentDeanDetailSerializer(incident).data)

    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(
                incident_number=generate_incident_number(),
                status=IncidentStatus.SUBMITTED,
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        incident = Incident.objects.select_related(
            "category",
            "location",
            "reporter",
        ).prefetch_related("images").get(pk=serializer.instance.pk)
        notify_admins_of_submission(incident)
        return Response(
            IncidentDetailSerializer(incident).data,
            status=status.HTTP_201_CREATED,
        )

    def _notify_reporter(self, incident, *, title, message, notification_type):
        Notification.objects.create(
            user=incident.reporter,
            title=title,
            message=message,
            notification_type=notification_type,
            related_incident=incident,
        )

    def _add_review_message(
        self,
        incident,
        sender,
        content,
        *,
        is_internal=False,
        channel=None,
    ):
        if not content.strip():
            return

        resolved_channel = channel
        if resolved_channel is None:
            if sender.role == UserRole.ADMIN:
                resolved_channel = MessageChannel.STUDENT_ADMIN
            elif sender.role == UserRole.DEAN:
                resolved_channel = MessageChannel.STUDENT_DEAN
            elif sender.role == UserRole.OFFICIAL:
                resolved_channel = MessageChannel.STUDENT_OFFICIAL
            else:
                resolved_channel = MessageChannel.STUDENT_ADMIN

        Message.objects.create(
            incident=incident,
            sender=sender,
            content=content.strip(),
            channel=resolved_channel,
            is_internal=False,
        )

    @action(detail=False, methods=["get"], url_path="official-stats")
    def official_stats(self, request):
        queryset = self.get_queryset()
        return Response(
            queryset.aggregate(
                assigned=Count("id", distinct=True, filter=Q(status=IncidentStatus.ASSIGNED)),
                in_progress=Count(
                    "id",
                    distinct=True,
                    filter=Q(status=IncidentStatus.IN_PROGRESS),
                ),
                resolved=Count("id", distinct=True, filter=Q(status=IncidentStatus.RESOLVED)),
                total_assigned=Count("id", distinct=True),
            )
        )

    @action(detail=False, methods=["get"], url_path="assigned")
    def assigned(self, request):
        queryset = (
            self.get_queryset()
            .filter(
                status__in={
                    IncidentStatus.ASSIGNED,
                    IncidentStatus.IN_PROGRESS,
                    IncidentStatus.RESOLVED,
                }
            )
            .order_by("-priority", "-updated_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = IncidentOfficialDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dean-stats")
    def dean_stats(self, request):
        queryset = self.get_queryset()
        return Response(
            queryset.aggregate(
                total_incidents=Count("id"),
                awaiting_action=Count(
                    "id",
                    filter=Q(status=IncidentStatus.FORWARDED_TO_DEAN),
                ),
                assigned=Count("id", filter=Q(status=IncidentStatus.ASSIGNED)),
                in_progress=Count("id", filter=Q(status=IncidentStatus.IN_PROGRESS)),
                resolved_awaiting_closure=Count(
                    "id",
                    filter=Q(status=IncidentStatus.RESOLVED),
                ),
                closed=Count("id", filter=Q(status=IncidentStatus.CLOSED)),
            )
        )

    @action(detail=False, methods=["get"], url_path="awaiting-action")
    def awaiting_action(self, request):
        queryset = (
            self.get_queryset()
            .filter(status=IncidentStatus.FORWARDED_TO_DEAN)
            .order_by("-priority", "created_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = IncidentDeanDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="currently-underway")
    def currently_underway(self, request):
        queryset = (
            self.get_queryset()
            .filter(
                status__in={
                    IncidentStatus.ASSIGNED,
                    IncidentStatus.IN_PROGRESS,
                }
            )
            .order_by("-priority", "-updated_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = IncidentDeanDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="resolved-awaiting-closure")
    def resolved_awaiting_closure(self, request):
        queryset = (
            self.get_queryset()
            .filter(status=IncidentStatus.RESOLVED)
            .order_by("-updated_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = IncidentDeanDetailSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="pending-review")
    def pending_review(self, request):
        queryset = (
            self.get_queryset()
            .filter(status__in=PENDING_REVIEW_STATUSES)
            .order_by("created_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = IncidentAdminReviewSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="review-stats")
    def review_stats(self, request):
        queryset = self.get_queryset()
        return Response(
            queryset.aggregate(
                pending_verification=Count(
                    "id",
                    filter=Q(status__in=PENDING_REVIEW_STATUSES),
                ),
                verified=Count("id", filter=Q(status=IncidentStatus.VERIFIED)),
                forwarded_to_dean=Count(
                    "id",
                    filter=Q(status=IncidentStatus.FORWARDED_TO_DEAN),
                ),
                rejected=Count("id", filter=Q(status=IncidentStatus.REJECTED)),
            )
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="images",
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_image(self, request, pk=None):
        incident = self.get_object()

        if request.user.role == UserRole.STUDENT:
            if incident.reporter_id != request.user.id:
                return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            if incident.status != IncidentStatus.SUBMITTED:
                return Response(
                    {"detail": "Images can only be added while the incident is submitted."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif not user_can_modify_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        uploaded_file = request.FILES.get("image")
        if not uploaded_file:
            raise ValidationError({"image": "An image file is required."})

        try:
            upload_result = upload_incident_image(uploaded_file, incident.incident_number)
        except ValidationError:
            raise
        except ValueError as exc:
            raise ValidationError({"image": str(exc)}) from exc
        except Exception as exc:
            raise ValidationError({"image": "We couldn't upload the image. Please try again."}) from exc

        image = IncidentImage.objects.create(
            incident=incident,
            cloudinary_public_id=upload_result["public_id"],
            cloudinary_url=upload_result["secure_url"],
            original_filename=getattr(uploaded_file, "name", ""),
            uploaded_by=request.user,
        )

        return Response(
            IncidentImageSerializer(image).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="public")
    def list_public(self, request):
        queryset = public_incident_queryset()
        page = self.paginate_queryset(queryset)
        serializer = PublicIncidentSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=["get"], url_path="public")
    def retrieve_public(self, request, pk=None):
        incident = public_incident_queryset().filter(pk=pk).first()
        if not incident:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicIncidentSerializer(incident)
        return Response(serializer.data)

    def _transition(self, incident, new_status, extra=None):
        if not is_valid_status_transition(incident.status, new_status):
            return Response(
                {"detail": f"Cannot transition from {incident.status} to {new_status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        incident.status = new_status
        now = timezone.now()

        if new_status == IncidentStatus.VERIFIED:
            incident.verified_at = now
        elif new_status == IncidentStatus.RESOLVED:
            incident.resolved_at = now
        elif new_status == IncidentStatus.CLOSED:
            incident.closed_at = now

        if extra:
            for key, value in extra.items():
                setattr(incident, key, value)

        incident.save()
        return Response(IncidentDetailSerializer(incident).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def verify(self, request, pk=None):
        incident = self.get_object()
        if not user_can_verify_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            admin_verify_and_forward(incident, verified_at=timezone.now())
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        self._add_review_message(incident, request.user, comment)
        self._notify_reporter(
            incident,
            title="Incident verified",
            message=f"Your incident {incident.incident_number} has been verified and forwarded for action.",
            notification_type=NotificationType.INCIDENT_VERIFIED,
        )

        incident.refresh_from_db()
        return Response(IncidentAdminReviewSerializer(incident).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        incident = self.get_object()
        if not user_can_admin_review_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"]

        try:
            admin_reject_incident(incident)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        self._add_review_message(incident, request.user, comment, is_internal=False)
        self._notify_reporter(
            incident,
            title="Incident rejected",
            message=f"Your incident {incident.incident_number} was rejected. Please review the message for details.",
            notification_type=NotificationType.INCIDENT_REJECTED,
        )

        incident.refresh_from_db()
        return Response(IncidentAdminReviewSerializer(incident).data)

    @action(detail=True, methods=["post"], url_path="request-info", permission_classes=[IsAdmin])
    def request_info(self, request, pk=None):
        incident = self.get_object()
        if not user_can_admin_review_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentRequestInfoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"]

        try:
            admin_request_more_information(incident)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        self._add_review_message(incident, request.user, comment, is_internal=False)
        self._notify_reporter(
            incident,
            title="More information requested",
            message=f"Additional information is required for incident {incident.incident_number}.",
            notification_type=NotificationType.INCIDENT_STATUS_CHANGED,
        )

        incident.refresh_from_db()
        return Response(IncidentAdminReviewSerializer(incident).data)

    @action(detail=True, methods=["post"], permission_classes=[IsDean])
    def assign(self, request, pk=None):
        incident = self.get_object()
        if not user_can_assign_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            assign_incident(
                incident,
                assigned_official=data["assigned_official"],
                assigned_by=request.user,
                responsible_party=data.get("responsible_party"),
                comment=data.get("comment", ""),
                priority=data.get("priority"),
            )
        except (InvalidStatusTransitionError, ValueError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if data.get("comment"):
            self._add_review_message(
                incident,
                request.user,
                data["comment"],
                channel=MessageChannel.STUDENT_OFFICIAL,
            )

        incident.refresh_from_db()
        return Response(IncidentDeanDetailSerializer(incident).data)

    @action(detail=True, methods=["post"], url_path="start-progress", permission_classes=[IsOfficial])
    def start_progress(self, request, pk=None):
        incident = self.get_object()
        if not user_can_start_progress_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            start_incident_progress(incident)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if comment:
            self._add_review_message(
                incident,
                request.user,
                comment,
                channel=MessageChannel.STUDENT_OFFICIAL,
            )

        incident.refresh_from_db()
        return Response(IncidentOfficialDetailSerializer(incident).data)

    @action(detail=True, methods=["post"], permission_classes=[IsOfficial])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        if not user_can_resolve_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"]

        try:
            resolve_assigned_incident(incident)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        self._add_review_message(
            incident,
            request.user,
            comment,
            channel=MessageChannel.STUDENT_OFFICIAL,
        )

        incident.refresh_from_db()
        return Response(IncidentOfficialDetailSerializer(incident).data)

    @action(detail=True, methods=["post"], permission_classes=[IsDean])
    def close(self, request, pk=None):
        incident = self.get_object()
        if not user_can_close_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            close_incident(incident, closed_by=request.user, comment=comment)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if comment:
            self._add_review_message(
                incident,
                request.user,
                comment,
                channel=MessageChannel.STUDENT_DEAN,
            )

        incident.refresh_from_db()
        return Response(IncidentDeanDetailSerializer(incident).data)

    @action(detail=True, methods=["post"], url_path="reopen", permission_classes=[IsDean])
    def reopen(self, request, pk=None):
        incident = self.get_object()
        if not user_can_reopen_incident(request.user, incident):
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            transition_incident(incident, IncidentStatus.IN_PROGRESS)
        except InvalidStatusTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if comment:
            self._add_review_message(
                incident,
                request.user,
                comment,
                channel=MessageChannel.STUDENT_DEAN,
            )

        Notification.objects.create(
            user=incident.reporter,
            title="Incident returned for additional work",
            message=f"Incident {incident.incident_number} requires further action.",
            notification_type=NotificationType.INCIDENT_STATUS_CHANGED,
            related_incident=incident,
        )

        assignment = incident.assignments.filter(is_current=True).select_related(
            "assigned_official"
        ).first()
        if assignment:
            Notification.objects.create(
                user=assignment.assigned_official,
                title="Incident returned for additional work",
                message=f"Please continue work on {incident.incident_number}.",
                notification_type=NotificationType.INCIDENT_STATUS_CHANGED,
                related_incident=incident,
            )

        incident.refresh_from_db()
        return Response(IncidentDeanDetailSerializer(incident).data)
