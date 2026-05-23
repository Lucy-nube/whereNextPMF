from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from apps.places.models import Place


from django.db import models
from django.conf import settings

class Trip(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    destination = models.CharField(max_length=200, blank=True, null=True)
    mood = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Campo de likes existente
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="liked_trips", blank=True)

    # =========================================================================
    # 🚀 NUEVOS CAMPOS: Configuración del tipo de viaje y compañero
    # =========================================================================
    # Almacena de forma estricta strings como: "solo", "couple" o "group"
    trip_type = models.CharField(max_length=20, default="solo")

    # Enlace ForeignKey directo a la tabla de usuarios para emparejar la aventura
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
        trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="comments")
        user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
        text = models.TextField()
        created_at = models.DateTimeField(auto_now_add=True)

        def __str__(self):
                return f"{self.user.username} - {self.trip.title}"


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


class TripPhoto(models.Model):
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="photos"
    )
    image = models.ImageField(upload_to="trip_photos/")
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo of {self.trip.title}"