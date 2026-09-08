from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.common.choices import AccountStatus, UserRole


class IsActiveUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.status == AccountStatus.ACTIVE
        )


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role == UserRole.STUDENT


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role == UserRole.ADMIN


class IsDean(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role == UserRole.DEAN


class IsOfficial(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role == UserRole.OFFICIAL


class IsAdminOrDean(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role in {
            UserRole.ADMIN,
            UserRole.DEAN,
        }


class IsDeanOrOfficial(BasePermission):
    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role in {
            UserRole.DEAN,
            UserRole.OFFICIAL,
        }


class IsStaffRole(BasePermission):
    """Admin, Dean, or Official."""

    def has_permission(self, request, view):
        return IsActiveUser().has_permission(request, view) and request.user.role in {
            UserRole.ADMIN,
            UserRole.DEAN,
            UserRole.OFFICIAL,
        }


class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
