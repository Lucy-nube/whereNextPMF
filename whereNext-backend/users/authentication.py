from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from users.models import User

class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(username=username, password=password)

        # intentar con email
        if user is None:
            try:
                user_obj = User.objects.get(email=username)

                user = authenticate(
                    username=user_obj.username,
                    password=password
                )

                # 🔥 IMPORTANTE
                attrs["username"] = user_obj.username

            except User.DoesNotExist:
                pass

        if user is None:
            raise Exception(
                "No active account found with the given credentials"
            )

        return super().validate(attrs)