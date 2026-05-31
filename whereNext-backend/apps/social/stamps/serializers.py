

from rest_framework import serializers
from .models import TravelStamp

class TravelStampSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelStamp
        fields = ["id", "label", "icon", "created_at"]
