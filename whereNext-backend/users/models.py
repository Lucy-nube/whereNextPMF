from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)

    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username
    
class Companion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    companion = models.ForeignKey(User, on_delete=models.CASCADE, related_name="companions_with")
    created_at = models.DateTimeField(auto_now_add=True)

class TripInvite(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_invites")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_invites")
    place = models.ForeignKey("places.Place", on_delete=models.CASCADE)

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