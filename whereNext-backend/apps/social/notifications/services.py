from .models import Notification


def create_notification(user, type, text):
    return Notification.objects.create(
        user=user,
        type=type,
        text=text
    )