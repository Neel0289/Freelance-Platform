from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow the freelancer who owns the resource.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'freelancer'):
            return obj.freelancer == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsFreelancer(permissions.BasePermission):
    """Only allow users with FREELANCER role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'FREELANCER'


class IsClientRole(permissions.BasePermission):
    """Only allow users with CLIENT role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CLIENT'
