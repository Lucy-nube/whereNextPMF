from rest_framework import serializers
from .models import Invite


class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = "__all__"

    def get_sender_avatar(self, obj):
        if obj.sender and getattr(obj.sender, "avatar", None):
            request = self.context.get("request")
            url = obj.sender.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None