from django.apps import AppConfig
import logging

class TripsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.trips' 

    def ready(self):
        logger = logging.getLogger(__name__)
        logger.info("🌿 whereNext by Lucy Esther De León Corporán")

