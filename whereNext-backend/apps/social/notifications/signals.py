from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

# Import your core models safely (Verify the exact directory layout namespace if needed)
from apps.trips.models import Trip
from apps.places.models import Comment # Maps to your Comment model layout from your first query
from .models import Notification

User = get_user_model()

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """
    💬 AUTOMATED COMMENT TRIGGER LIFECYCLE
    Listens to your Place comments table. Whenever a traveler posts a comment,
    it automatically spins up an unread notification record for the owner.
    """
    if created:
        comment_author = instance.user
        associated_place = instance.place
        
        # Identify who needs to receive the notification alert
        # Look at who created the Place row using your exact 'created_by' FK key field constraint
        place_owner = associated_place.created_by

        # Guard check: Prevent sending notifications if you comment on your own preset Place cards
        if place_owner and place_owner != comment_author:
            try:
                # Truncate the text preview string so it doesn't overload your dropdown layouts
                preview_text = instance.text[:40] + "..." if len(instance.text) > 40 else instance.text
                
                Notification.objects.create(
                    user=place_owner,
                    from_user=comment_author,
                    notification_type="COMMENT",
                    text_preview=preview_text,
                    is_read=False
                )
            except Exception as sig_err:
                print(f"🔬 Comment signal exception caught safely: {sig_err}")
