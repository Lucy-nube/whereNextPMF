from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    from_user = serializers.SerializerMethodField()
    trip_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "text_preview",
            "from_user",
            "trip_id",
            "created_at",
            "is_read",
        ]

    def get_from_user(self, obj):
        return obj.from_user.username

    def get_trip_id(self, obj):
        # Si en el futuro agregas notificaciones de viajes, ya está preparado
        return getattr(obj, "trip_id", None)
