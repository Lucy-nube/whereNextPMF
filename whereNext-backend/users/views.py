from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from .authentication import EmailOrUsernameTokenObtainPairSerializer


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class MeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "avatar": user.avatar.url if user.avatar else None,
        })

    def put(self, request):
        user = request.user

        user.username = request.data.get(
            "username",
            user.username
        )

        user.bio = request.data.get(
            "bio",
            user.bio
        )

        if "avatar" in request.FILES:
            user.avatar = request.FILES["avatar"]

        user.save()

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "avatar": user.avatar.url if user.avatar else None,
        })