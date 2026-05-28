from rest_framework import serializers
from .models import Companion
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


class CompanionSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    companion = UserMiniSerializer(read_only=True)

    class Meta:
        model = Companion
        fields = ["id", "user", "companion", "status", "created_at"]
