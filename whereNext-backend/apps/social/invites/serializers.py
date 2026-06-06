from rest_framework import serializers
from .models import Invite
from rest_framework import serializers
from apps.users.serializers import PublicUserSerializer
from apps.trips.serializers import TripSerializer
from apps.users.models import TripInvite
from apps.trips.models import Trip


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
    
class MinimalTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id", "title", "destination"]

class TripInviteSerializer(serializers.ModelSerializer):
    from_user = PublicUserSerializer(read_only=True)
    to_user = PublicUserSerializer(read_only=True)
    trip = MinimalTripSerializer(read_only=True)

    class Meta:
        model = TripInvite
        fields = ["id", "from_user", "to_user", "trip", "status", "created_at"]
