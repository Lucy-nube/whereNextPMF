from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from apps.users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from .models import Companion
from rest_framework import serializers
from django.contrib.auth import get_user_model


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        username_or_email = attrs.get("username")
        password = attrs.get("password")

        # 1. LOGIN POR USERNAME
        user = authenticate(
            username=username_or_email,
            password=password
        )

        # 2. LOGIN POR EMAIL
        if user is None:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(
                    username=user_obj.username,
                    password=password
                )
            except User.DoesNotExist:
                user = None

        # 3. ERROR FINAL
        if user is None:
            raise AuthenticationFailed(
                "No active account found with the given credentials"
            )

        # ⭐ RESTAURAR LA LÍNEA CRÍTICA
        attrs["username"] = user.username

        # ⭐ LLAMAR A SIMPLEJWT PARA VALIDACIÓN INTERNA
        data = super().validate(attrs)

        # ⭐ AÑADIR TU RESPUESTA PERSONALIZADA
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

        return data


class CompanionSerializer(serializers.ModelSerializer):

    companion_username = serializers.CharField(source="companion.username", read_only=True)
    companion_avatar = serializers.CharField(source="companion.avatar.url", read_only=True)

    class Meta:
        model = Companion
        fields = "__all__"




User = get_user_model()

class serializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email","avatar"]

class Publicuserserializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "avatar"]

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None
