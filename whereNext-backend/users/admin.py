from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        (
            "Perfil",
            {
                "fields": (
                    "bio",
                    "avatar",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Perfil",
            {
                "fields": (
                    "bio",
                    "avatar",
                )
            },
        ),
    )