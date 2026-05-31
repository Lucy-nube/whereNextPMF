from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Companion(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_companions")
    companion = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_companions")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "companion")

    def __str__(self):
        return f"{self.user} → {self.companion} ({self.status})"
