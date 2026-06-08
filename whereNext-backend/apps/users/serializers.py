from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.models import Profile
from apps.users.models import TripInvite 
from apps.users.models import Profile  



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
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["bio", "avatar", "is_private"]

    def get_avatar(self, obj):
     request = self.context.get("request")

     if obj.avatar:
         url = obj.avatar.url
         return request.build_absolute_uri(url) if request else url

     return None
 

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



