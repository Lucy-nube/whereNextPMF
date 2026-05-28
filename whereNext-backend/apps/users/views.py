# =========================================================
# DJANGO / MODELS / UTILS
# =========================================================
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

# =========================================================
# DRF CORE
# =========================================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
# =========================================================
# LOCAL IMPORTS
# =========================================================
from .authentication import EmailOrUsernameTokenObtainPairSerializer
from .serializers import UserSerializer, PublicUserSerializer,ProfileSerializer
from .models import Profile, User

User = get_user_model()


# =========================================================
# LOGIN PERSONALIZADO
# =========================================================
class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


# =========================================================
# PERFIL /api/me/
# =========================================================
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# apps/users/views.py


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)



# =========================================================
# PERFIL PÚBLICO (SIN LÓGICA SOCIAL)
# =========================================================
class PublicUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        return Response(PublicUserSerializer(user).data)


# =========================================================
# BUSCADOR DE USUARIOS
# =========================================================
class UsersearchView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('search', '').strip()

        if not query:
            return Response([])

        if query.lower() == "all":
            users = User.objects.exclude(id=request.user.id)[:10]
        else:
            users = User.objects.filter(
                username__icontains=query
            ).exclude(id=request.user.id)[:10]

        return Response([
            {
                "id": u.id,
                "username": u.username,
                "avatar": u.profile.avatar.url if u.profile.avatar else None,
                "bio": u.profile.bio or ""
            }
            for u in users
        ])



User = get_user_model()

from .models import Profile

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not username or not email or not password:
            return Response({"error": "Todos los campos son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({"error": "El nombre de usuario ya está registrado"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "El correo electrónico ya está registrado"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password)
            )

            # 🔥 CREA EL PROFILE AUTOMÁTICAMENTE
            Profile.objects.create(
                user=new_user,
                bio="¡Nuevo explorador de WhereNext!"
            )

            refresh = RefreshToken.for_user(new_user)

            return Response({
                "message": "Usuario registrado con éxito",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": new_user.id,
                    "username": new_user.username,
                    "email": new_user.email
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"🔬 Excepción en el registro del PFM: {e}")
            return Response({"error": "Fallo interno al procesar el pasaporte de viajero"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
