from django.db import models
from django.conf import settings

class Place(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    category = models.CharField(
        max_length=50,
        choices=[
            ("CITY", "City"),
            ("NATURE", "Nature"),
            ("BEACH", "Beach"),
            ("MUSEUM", "Museum"),
            ("FOOD", "Food"),
        ],
        default="CITY",
    )

    image_url = models.URLField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="places"
    )

    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_places",
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Comment(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)