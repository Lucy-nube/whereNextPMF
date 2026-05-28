from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile, TripInvite
from apps.social.companions.models import Companion

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Perfil"
    fk_name = "user"


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)

    list_display = ("username", "email", "get_avatar")

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return "—"

    get_avatar.short_description = "Avatar"
