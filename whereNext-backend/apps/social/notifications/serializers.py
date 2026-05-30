from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class NotificationSerializer(serializers.ModelSerializer):
    from_user = UserMiniSerializer(read_only=True)
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

    def get_trip_id(self, obj):
        return getattr(obj.related_object, "id", None)
