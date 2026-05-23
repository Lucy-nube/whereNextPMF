from rest_framework import serializers
from .models import Place
from users.serializers import UserSerializer

class PlaceSerializer(serializers.ModelSerializer):

    owner = UserSerializer(source="created_by", read_only=True)

    class Meta:
        model = Place
        fields = "__all__"

