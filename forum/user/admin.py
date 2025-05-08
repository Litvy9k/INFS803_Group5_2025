from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'nickname', 'avatar')}),
        (_('Permissions'),   {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_moderator', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'last_seen', 'registered_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'nickname', 'password1', 'password2'),
        }),
    )
    list_display = ('username', 'email', 'nickname', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'nickname')
    ordering = ('username',)