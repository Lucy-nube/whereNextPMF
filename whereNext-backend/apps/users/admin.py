from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "get_avatar")

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return "—"

admin.site.register(Profile)
