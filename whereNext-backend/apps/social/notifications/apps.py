from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    """
    🔔 WHERENEXT REAL-TIME ALERTS NOTIFICATIONS CORE LIFE CYCLE
    Manages the background registration triggers for connection invites, 
    unread messaging counts, and profile interaction alerts.
    """
    default_auto_field = "django.db.models.BigAutoField"
    
    # 🚀 CORE MODULE ROUTING NAME
    name = "apps.social.notifications"
    verbose_name = "WhereNext Notifications Hub"

    def ready(self):
        """
        🚀 SIGNAL INJECTION JUNCTION MASTER HOOK:
        Crucial for your navbar alert counters! Automatically mounts signal listeners 
        so that liking, commenting, or inviting instantly updates database rows 
        and triggers your frontend polling navbar indicators cleanly.
        """
        try:
            import apps.social.notifications.signals
            print("🚀 System Notifications database signals mounted successfully.")
        except ImportError as signal_err:
            print(f"🔬 Notifications lifecycle trace info: {signal_err}")
