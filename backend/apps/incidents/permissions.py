from rest_framework.permissions import BasePermission

from apps.common.authorization import user_can_view_incident


class IncidentObjectPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return user_can_view_incident(request.user, obj)
