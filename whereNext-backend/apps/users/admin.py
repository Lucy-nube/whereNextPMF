from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Companion, Profile, TripInvite


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "Perfil",
            {
                "fields": ("bio", "avatar"),
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Perfil",
            {
                "fields": ("bio", "avatar"),
            },
        ),
    )


@admin.register(Companion)
class CompanionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "companion", "status", "created_at")
    search_fields = ("user__username", "companion__username")
    list_filter = ("status", "created_at")