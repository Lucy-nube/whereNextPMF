from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from users.models import User


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

        # 4. IMPORTANTE: usar usuario real
        data = super().validate({
            "username": user.username,
            "password": password
        })

        return data