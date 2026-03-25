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

class IsParticipant(permissions.BasePermission):
    """
    Allows the freelancer full access, and allows the client read-only or payment actions.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'freelancer') and obj.freelancer == request.user:
            return True
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
            
        # Check if the user is the associated client
        is_client = False
        if hasattr(obj, 'client') and hasattr(obj.client, 'email') and request.user.email == obj.client.email:
            is_client = True
            
        if is_client:
            # Clients can GET. Also allow POST for custom actions like verify-payment which 
            # uses check_object_permissions before the action if detail=True.
            if request.method in ['GET', 'HEAD', 'OPTIONS', 'POST']:
                return True
                
        return False


class IsFreelancer(permissions.BasePermission):
    """Only allow users with FREELANCER role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'FREELANCER'


class IsClientRole(permissions.BasePermission):
    """Only allow users with CLIENT role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CLIENT'
