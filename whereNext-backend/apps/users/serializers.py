from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.users.models import Profile, TripInvite
from apps.places.models import Place



User = get_user_model()



class UserSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(source="profile.bio", read_only=True)
    avatar = serializers.SerializerMethodField()
    is_private = serializers.BooleanField(source="profile.is_private", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "bio", "avatar", "is_private"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["bio", "avatar", "is_private"]


class PublicUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar", "bio"]

    def get_avatar(self, obj):
     # Avatar en User
     if getattr(obj, "avatar", None):
        return obj.avatar.url

     # Avatar en Profile
     if hasattr(obj, "profile") and obj.profile.avatar:
        return obj.profile.avatar.url

     return None




    def get_bio(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.bio
        return ""

    
class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    bio = serializers.CharField(source="profile.bio", read_only=True)
    is_private = serializers.BooleanField(source="profile.is_private", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "avatar", "bio", "is_private"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class TripInviteSerializer(serializers.ModelSerializer):
    from_user = PublicUserSerializer(read_only=True)
    to_user = PublicUserSerializer(read_only=True)

    class Meta:
        model = TripInvite
        fields = [
            "id",
            "from_user",
            "to_user",
            "place",
            "status",
            "created_at",
        ]
