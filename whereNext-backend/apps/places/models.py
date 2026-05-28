from django.conf import settings
from django.db import models


class Place(models.Model):

    CATEGORY_CHOICES = [
        ("CITY", "City"),
        ("NATURE", "Nature"),
        ("BEACH", "Beach"),
        ("MUSEUM", "Museum"),
        ("FOOD", "Food"),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="CITY",
    )

    image_url = models.URLField(blank=True)

    # 🔥 IMPORTANTE: permitir null temporalmente para migración
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="places",
        null=True,
        blank=True,
    )

    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_places",
        blank=True
    )

    is_official = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    

    @property
    def source_type(self):
        """
        🚀 FIXED: Maps directly to 'created_by' to permanently resolve the internal evaluation crash.
        Checks if the destination is marked official, or if it was uploaded by an administrator/staff account.
        """
        if self.is_official or (self.created_by and self.created_by.is_staff):
            return "OFFICIAL"
        return "TRAVELER"


class Comment(models.Model):
    """
    Comentarios simples asociados a un Place
    (evita el error de total_comments si no tenías el modelo)
    """

    place = models.ForeignKey(
        Place,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.place}"