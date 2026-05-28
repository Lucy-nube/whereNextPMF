from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings


class Trip(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips"
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    destination = models.CharField(max_length=200, blank=True, null=True)
    mood = models.CharField(max_length=50, blank=True, null=True)

    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    is_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_trips",
        blank=True
    )

    # =========================================================================
    # CONFIG VIAJE
    # =========================================================================

    trip_type = models.CharField(
        max_length=20,
        default="solo"
    )

    co_traveler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="co_adventures"
    )

    def __str__(self):
        return self.title


class TripComment(models.Model):
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="comments"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.trip.title}"





class TripPlace(models.Model):

    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="trip_places",
    )

    place = models.ForeignKey(
        "places.Place",
        on_delete=models.CASCADE,
        related_name="trip_places",
    )

    day = models.IntegerField(
        validators=[MinValueValidator(1)]
    )

    order = models.IntegerField(
        validators=[MinValueValidator(1)]
    )

    notes = models.CharField(
        max_length=255,
        blank=True
    )

    # ⭐ IMPORTANTE: tracking social
    added_by = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="added_trip_places"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day", "order"]

        # evita duplicados dentro del mismo día
        unique_together = ["trip", "place", "day", "order"]

    def __str__(self):
        return f"{self.place.name} in {self.trip.title}"

class TripPhoto(models.Model):
    trip = models.ForeignKey(
        "trips.Trip",
        on_delete=models.CASCADE,
        related_name="photos"
    )

    image = models.ImageField(
        upload_to="trip_photos/"
    )

    caption = models.CharField(
        max_length=255,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo of {self.trip.title}"