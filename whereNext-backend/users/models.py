from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings



class User(AbstractUser):
    email = models.EmailField(unique=True)

    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.username
    
# En tu users/models.py (Asegúrate de que tu modelo Profile tenga esta línea)
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    
    # 🚀 NUEVO CAMPO DE PRIVACIDAD: Por defecto los perfiles son públicos
    is_private = models.BooleanField(default=False) 

    def __str__(self):
        return f"Perfil de {self.user.username}"

    
class Companion(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_companions"
    )

    companion = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_companions"
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
        unique_together = ("user", "companion")

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