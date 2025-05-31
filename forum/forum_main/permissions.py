from rest_framework import permissions

class IsAuthorOrMod(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and
            (request.user.is_moderator or obj.author.id == request.user.id)
        )

class IsAuthenticatedAndActive(permissions.BasePermission):
    
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and
            user.is_authenticated and
            user.is_active
        )