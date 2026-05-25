from rest_framework import serializers
from .models import Place
from apps.users.serializers import Userserializer


class PlaceSerializer(serializers.ModelSerializer):
    source_type = serializers.ReadOnlyField()

    class Meta:
        model = Place
        fields = "__all__"