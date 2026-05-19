from django.db import models
from django.conf import settings


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

    # 👤 usuario que sube el lugar
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="places"
    )

    # ❤️ likes
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_places",
        blank=True
    )

    # 🌍 lugar oficial de la app
    is_official = models.BooleanField(default=False)

    # ✔ lugar verificado
    verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def total_likes(self):
        return self.likes.count()

    def total_comments(self):
        return self.comments.count()

    def __str__(self):
        return self.name


class Comment(models.Model):

    place = models.ForeignKey(
        Place,
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
        return f"{self.user} - {self.place}"