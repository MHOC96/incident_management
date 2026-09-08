from rest_framework import serializers

from apps.accounts.models import User
from apps.common.choices import AccountStatus, UserRole
from apps.common.validators import validate_sri_lanka_phone


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "role", "position"]
        read_only_fields = fields


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "mc_number",
            "role",
            "position",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "mc_number",
            "role",
            "position",
            "status",
            "created_at",
        ]

    def validate_phone(self, value):
        if not value:
            return ""
        try:
            return validate_sri_lanka_phone(value, required=False)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "name",
            "email",
            "phone",
            "mc_number",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def validate_phone(self, value):
        try:
            return validate_sri_lanka_phone(value, required=True)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        validated_data["role"] = UserRole.STUDENT
        return User.objects.create_user(password=password, **validated_data)


class OfficialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "name",
            "email",
            "phone",
            "position",
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if not value:
            return ""
        try:
            return validate_sri_lanka_phone(value, required=False)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc


class OfficialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "position",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class OfficialStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["status"]

    def validate_status(self, value):
        if value not in {AccountStatus.ACTIVE, AccountStatus.INACTIVE}:
            raise serializers.ValidationError("Only active or inactive status is allowed.")
        return value

    def update(self, instance, validated_data):
        instance.status = validated_data["status"]
        instance.is_active = instance.status == AccountStatus.ACTIVE
        instance.save(update_fields=["status", "is_active", "updated_at"])
        return instance


class OfficialActivateSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=8)
    password_confirm = serializers.CharField(required=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs
