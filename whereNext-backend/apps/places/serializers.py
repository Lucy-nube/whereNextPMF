from rest_framework import serializers
from .models import Place
from apps.users.serializers import PublicUserSerializer


class PlaceSerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(source="created_by", read_only=True)
    source_type = serializers.ReadOnlyField()

    class Meta:
        model = Place
        fields = "__all__"
