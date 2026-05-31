from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.social.chats.models import ChatRoom, Message

User = get_user_model()

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "avatar"]  

class ChatRoomSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    unread = serializers.SerializerMethodField()
    room = serializers.IntegerField(source="id")

    class Meta:
        model = ChatRoom
        fields = ["room", "friend", "last_message", "timestamp", "unread"]

    def get_friend(self, obj):
        request_user = self.context["request"].user
        friend = obj.users.exclude(id=request_user.id).first()
        return PublicUserSerializer(friend).data

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return msg.text if msg else None

    def get_timestamp(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return msg.created_at.isoformat() if msg else None

    def get_unread(self, obj):
        request_user = self.context["request"].user
        return obj.messages.filter(receiver=request_user, is_read=False).exists()

