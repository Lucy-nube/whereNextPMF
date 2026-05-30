from rest_framework import serializers
from .models import Place, Comment
from apps.users.serializers import PublicUserSerializer


class PlaceCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "place",
            "user",
            "user_username",
            "user_avatar",
            "text",
            "created_at",
        ]
        read_only_fields = ["user", "place", "created_at"]

    def get_user_avatar(self, obj):
     user = obj.user

     # Avatar en User
     if getattr(user, "avatar", None):
        return user.avatar.url

     # Avatar en Profile
     if hasattr(user, "profile") and user.profile.avatar:
        return user.profile.avatar.url

     return None




class PlaceSerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(source="created_by", read_only=True)
    source_type = serializers.ReadOnlyField()
    comments = PlaceCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = "__all__"

