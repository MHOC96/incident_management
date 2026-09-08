from rest_framework import serializers

from apps.accounts.models import User
from apps.assignments.models import Assignment, ResponsibleParty
from apps.common.choices import AccountStatus, IncidentPriority, UserRole
from apps.incidents.models import Category, Incident, IncidentImage, Location


class ReporterAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "mc_number",
            "department",
            "year",
        ]
        read_only_fields = fields


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "building", "floor", "faculty", "is_active"]


class IncidentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentImage
        fields = [
            "id",
            "cloudinary_url",
            "original_filename",
            "uploaded_at",
        ]
        read_only_fields = fields


class PublicIncidentSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    images = IncidentImageSerializer(many=True, read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id",
            "incident_number",
            "title",
            "description",
            "category",
            "location",
            "status",
            "priority",
            "visibility",
            "images",
            "created_at",
            "updated_at",
            "verified_at",
            "resolved_at",
            "closed_at",
        ]
        read_only_fields = fields


class IncidentAdminReviewSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    images = IncidentImageSerializer(many=True, read_only=True)
    reporter = ReporterAdminSerializer(read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id",
            "incident_number",
            "title",
            "description",
            "category",
            "location",
            "status",
            "priority",
            "visibility",
            "reporter",
            "images",
            "created_at",
            "updated_at",
            "verified_at",
            "resolved_at",
            "closed_at",
        ]
        read_only_fields = fields


class IncidentDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    images = IncidentImageSerializer(many=True, read_only=True)
    reporter_name = serializers.CharField(source="reporter.name", read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id",
            "incident_number",
            "title",
            "description",
            "category",
            "location",
            "status",
            "priority",
            "visibility",
            "reporter",
            "reporter_name",
            "images",
            "created_at",
            "updated_at",
            "verified_at",
            "resolved_at",
            "closed_at",
        ]
        read_only_fields = [
            "id",
            "incident_number",
            "status",
            "reporter",
            "reporter_name",
            "created_at",
            "updated_at",
            "verified_at",
            "resolved_at",
            "closed_at",
        ]


class IncidentDeanDetailSerializer(IncidentAdminReviewSerializer):
    current_assignment = serializers.SerializerMethodField()

    class Meta(IncidentAdminReviewSerializer.Meta):
        fields = IncidentAdminReviewSerializer.Meta.fields + ["current_assignment"]

    def get_current_assignment(self, obj):
        assignment = obj.assignments.filter(is_current=True).select_related(
            "assigned_official",
            "assigned_by",
            "responsible_party",
        ).first()
        if not assignment:
            return None
        return AssignmentSerializer(assignment).data


class IncidentResolveSerializer(serializers.Serializer):
    comment = serializers.CharField(required=True, min_length=5)


class IncidentOfficialDetailSerializer(IncidentDetailSerializer):
    current_assignment = serializers.SerializerMethodField()

    class Meta(IncidentDetailSerializer.Meta):
        fields = IncidentDetailSerializer.Meta.fields + ["current_assignment"]

    def get_current_assignment(self, obj):
        assignment = obj.assignments.filter(is_current=True).select_related(
            "assigned_official",
            "assigned_by",
            "responsible_party",
        ).first()
        if not assignment:
            return None
        return AssignmentSerializer(assignment).data


class IncidentStudentDetailSerializer(IncidentDetailSerializer):
    current_assignment = serializers.SerializerMethodField()

    class Meta(IncidentDetailSerializer.Meta):
        fields = IncidentDetailSerializer.Meta.fields + ["current_assignment"]

    def get_current_assignment(self, obj):
        assignment = obj.assignments.filter(is_current=True).select_related(
            "assigned_official",
            "assigned_by",
            "responsible_party",
        ).first()
        if not assignment:
            return None
        return AssignmentSerializer(assignment).data


class IncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            "title",
            "description",
            "category",
            "location",
            "visibility",
        ]

    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Selected category is not available.")
        return value

    def validate_location(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Selected location is not available.")
        return value

    def create(self, validated_data):
        validated_data["reporter"] = self.context["request"].user
        return super().create(validated_data)


class IncidentActionSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, allow_blank=True)


class IncidentRejectSerializer(serializers.Serializer):
    comment = serializers.CharField(required=True, min_length=5)


class IncidentRequestInfoSerializer(serializers.Serializer):
    comment = serializers.CharField(required=True, min_length=5)


class IncidentAssignSerializer(serializers.Serializer):
    assigned_official = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.OFFICIAL, status=AccountStatus.ACTIVE),
    )
    responsible_party = serializers.PrimaryKeyRelatedField(
        queryset=ResponsibleParty.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    comment = serializers.CharField(required=False, allow_blank=True)
    priority = serializers.ChoiceField(
        choices=IncidentPriority.choices,
        required=False,
        allow_null=True,
    )


class IncidentPriorityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ["priority"]


class AssignmentSerializer(serializers.ModelSerializer):
    assigned_official_name = serializers.CharField(
        source="assigned_official.name",
        read_only=True,
    )
    assigned_by_name = serializers.CharField(source="assigned_by.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "incident",
            "assigned_official",
            "assigned_official_name",
            "assigned_by",
            "assigned_by_name",
            "responsible_party",
            "comment",
            "is_current",
            "assigned_at",
        ]
        read_only_fields = [
            "id",
            "assigned_by",
            "assigned_by_name",
            "is_current",
            "assigned_at",
        ]


class ResponsiblePartySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponsibleParty
        fields = ["id", "name", "description", "is_active", "officials"]
        read_only_fields = ["id"]

    def validate_officials(self, value):
        invalid = [user for user in value if user.role != UserRole.OFFICIAL]
        if invalid:
            raise serializers.ValidationError("All assigned users must be officials.")
        return value
