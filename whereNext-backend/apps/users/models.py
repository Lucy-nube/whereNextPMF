from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# =========================
# USER BASE (solo cuenta)
# =========================
class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


# =========================
# PROFILE (perfil editable)
# =========================
class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    is_private = models.BooleanField(default=False)

    def __str__(self):
        return f"Perfil de {self.user.username}"


# =========================
# TRIP INVITES (invitaciones a lugares)
# =========================
class TripInvite(models.Model):
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_trip_invites"
    )

    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_trip_invites"
    )

    place = models.ForeignKey(
        "places.Place",
        on_delete=models.CASCADE,
        related_name="trip_invites"
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("ACCEPTED", "Accepted"),
            ("DECLINED", "Declined"),
        ],
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_user", "to_user", "place")

    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username} ({self.place.name}) [{self.status}]"
