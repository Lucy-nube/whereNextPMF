from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from apps.places.models import Place

class Trip(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trips",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    is_public = models.BooleanField(default=False)

    places = models.ManyToManyField(
        Place,
        through="TripPlace",
        related_name="trips",
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.owner.username})"


class TripPlace(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="trip_places",
    )
    place = models.ForeignKey(
        Place,
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

    class Meta:
        ordering = ["day", "order"]

    def __str__(self):
        return f"{self.place.name} in {self.trip.title}"
