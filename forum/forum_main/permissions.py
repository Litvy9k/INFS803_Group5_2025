from rest_framework import permissions

class IsAuthorOrAdmin(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user and
            (request.user.is_moderator or obj.author.id == request.user.id)
        )