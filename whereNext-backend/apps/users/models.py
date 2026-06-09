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
from cloudinary.models import CloudinaryField

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    bio = models.TextField(blank=True)

    avatar = CloudinaryField(
        "avatar",
        blank=True,
        null=True
    )

    is_private = models.BooleanField(default=False)

# =========================
# TRIP INVITES (invitaciones a lugares)
# =========================

class TripInvite(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("DECLINED", "Declined"),
        ("CANCELLED", "Cancelled"),  
    ]

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

    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="trip_invites"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_user", "to_user", "trip")

    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username} ({self.trip.title}) [{self.status}]"
