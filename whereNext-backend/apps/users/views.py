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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        avatar_url = None
        if profile.avatar:
            try:
                avatar_url = request.build_absolute_uri(profile.avatar.url)
            except Exception:
                # Cloudinary u otro storage que ya devuelve URL absoluta
                avatar_url = profile.avatar.url

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "bio": profile.bio or "",
            "avatar": avatar_url,
            "is_private": profile.is_private,
        })

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)

        # texto
        profile.bio = request.data.get("bio", profile.bio)
        profile.is_private = request.data.get("is_private", profile.is_private)

        # imagen
        if request.FILES.get("avatar"):
            profile.avatar = request.FILES["avatar"]

        profile.save()

        print("FILES:", request.FILES)
        print("DATA:", request.data)

        return Response({
            "bio": profile.bio,
            "avatar": profile.avatar.url if profile.avatar else None,
            "is_private": profile.is_private,
        })

# =========================================================
# PERFIL PÚBLICO (SIN LÓGICA SOCIAL)
# =========================================================
class PublicUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
      
        return Response(
     PublicUserSerializer(user, context={"request": request}).data
)


# =========================================================
# BUSCADOR DE USUARIOS
# =========================================================
class UsersearchView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('search', '').strip()

        # Base: solo usuarios públicos y nunca yo
        users = User.objects.filter(
            profile__is_private=False
        ).exclude(id=request.user.id)

        # Si hay texto, filtro
        if query:
            users = users.filter(username__icontains=query)

        users = users[:20]

        result = []
        for u in users:
            profile = getattr(u, "profile", None)
            avatar = profile.avatar.url if profile and profile.avatar else None
            bio = profile.bio if profile and profile.bio else ""

            result.append({
                "id": u.id,
                "username": u.username,
                "avatar": avatar,
                "bio": bio
            })

        return Response(result)



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

            #   CREA EL PROFILE AUTOMÁTICAMENTE
            profile, _ = Profile.objects.get_or_create(user=new_user)
            profile.bio = "¡Nuevo explorador de WhereNext!"
            profile.save()

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
