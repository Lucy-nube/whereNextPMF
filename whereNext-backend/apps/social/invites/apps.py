from django.apps import AppConfig


class InvitesConfig(AppConfig):
    """
    ✈️ WHERENEXT INVITES SYSTEM CONFIGURATION
    Manages the lifecycle validation parameters for multi-traveler group 
    expeditions, co-traveler links, and trip invitation response tokens.
    """
    default_auto_field = "django.db.models.BigAutoField"
    
    # 🚀 CORE MODULE ROUTING NAME (Points to your nested apps package directory)
    name = "apps.social.invites"
    verbose_name = "WhereNext Trip Invites"

    def ready(self):
        """
        🚀 SIGNALS DISPATCH MATRIX REGISTRY Hook:
        Imports and hooks background database action listeners the moment the engine initializes,
        safeguarding invitation lifecycle pipelines against unexpected transaction blocks.
        """
        try:
            import apps.social.invites.signals  #
        except ImportError:
            # Safe boundary pass if no signals are declared inside your module yet
            pass
