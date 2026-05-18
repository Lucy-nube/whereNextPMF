from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from users.models import User

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        # Intentar login con username
        user = authenticate(username=username_or_email, password=password)

        # Intentar login con email
        if user is None:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is None:
            raise AuthenticationFailed("No active account found with the given credentials")

        # ⭐ CLAVE ABSOLUTA: Sobrescribir username para SimpleJWT
        attrs["username"] = user.username

        # Generar tokens
        data = super().validate(attrs)
        return data
