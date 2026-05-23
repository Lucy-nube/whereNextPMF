# =========================
# DJANGO & MODELS
# =========================
from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

# =========================
# DRF CORE
# =========================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView

# =========================
# MODELOS Y SERIALIZADORES
# =========================
from .authentication import EmailOrUsernameTokenObtainPairSerializer
from .models import Companion, TripInvite
from .serializers import CompanionSerializer

from apps.trips.models import Trip
from users.models import User   # Tu User real


# =========================
# LOGIN
# =========================
class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


# =========================
# ME
# =========================
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
        user.username = request.data.get("username", user.username)
        user.bio = request.data.get("bio", user.bio)

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


# =========================
# COMPANIONS (AMIGOS)
# =========================
class IsCompanionView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        exists = Companion.objects.filter(
            user=request.user,
            companion_id=user_id,
            status="ACCEPTED"
        ).exists()
        return Response({"is_companion": exists})


class CompanionViewSet(ModelViewSet):
    queryset = Companion.objects.all()
    serializer_class = CompanionSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Companion.objects.filter(
            Q(user=self.request.user) | Q(companion=self.request.user)
        )

    @action(detail=False, methods=['post'], url_path='invite/(?P<user_id>[0-9]+)')
    def invite(self, request, user_id=None):
        target_user = get_object_or_404(User, id=user_id)
        
        if request.user == target_user:
            return Response({"error": "You cannot add yourself"}, status=400)

        existing = Companion.objects.filter(
            Q(user=request.user, companion=target_user) |
            Q(user=target_user, companion=request.user)
        ).first()

        if existing:
            return Response({"status": existing.status, "message": "Relationship already exists"})

        instance = Companion.objects.create(
            user=request.user,
            companion=target_user,
            status="PENDING"
        )
        return Response({"status": "PENDING", "id": instance.id}, status=201)

    @action(detail=False, methods=['post'], url_path='accept/(?P<request_id>[0-9]+)')
    def accept(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id, companion=request.user)
        instance.status = "ACCEPTED"
        instance.save()
        return Response({"status": "ACCEPTED"})

    @action(detail=False, methods=['post'], url_path='reject/(?P<request_id>[0-9]+)')
    def reject(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id, companion=request.user)
        instance.delete()
        return Response({"status": "REMOVED"})


# =========================
# FEED GLOBAL
# =========================
class FeedTripsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friends = Companion.objects.filter(
            Q(user=user) | Q(companion=user)
        )

        friend_ids = {f.user_id for f in friends} | {f.companion_id for f in friends}

        trips = Trip.objects.filter(
            Q(owner=user) |
            Q(owner__id__in=friend_ids) |
            Q(is_public=True)
        ).select_related("owner").order_by("-created_at")

        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "created_at": t.created_at,
                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    "avatar": t.owner.avatar.url if t.owner.avatar else None,
                }
            }
            for t in trips
        ])


# =========================
# PERFIL PÚBLICO
# =========================
class PublicUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        is_friend = Companion.objects.filter(
            (Q(user=request.user, companion=user) |
             Q(user=user, companion=request.user)),
            status="ACCEPTED"
        ).exists()

        return Response({
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar.url if user.avatar else None,
            "bio": user.bio,
            "is_friend": is_friend
        })


class UserTripsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        trips = Trip.objects.filter(owner_id=user_id).order_by("-created_at")
        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "created_at": t.created_at,
                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    "avatar": t.owner.avatar.url if t.owner.avatar else None,
                }
            }
            for t in trips
        ])


# =========================
# BUSCADOR GLOBAL
# =========================
class UserSearchView(APIView):
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
                "avatar": u.avatar.url if u.avatar else None,
                "bio": u.bio or ""
            }
            for u in users
        ])


# =========================
# INVITACIONES A VIAJES
# =========================
class SendTripInviteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_user_id = request.data.get("to_user_id")
        place_id = request.data.get("place_id")

        if not to_user_id or not place_id:
            return Response({"error": "Faltan parámetros requeridos"}, status=400)

        to_user = get_object_or_404(User, id=to_user_id)

        invite, created = TripInvite.objects.get_or_create(
            from_user=request.user,
            to_user=to_user,
            place_id=place_id,
            defaults={"status": "PENDING"}
        )

        if not created and invite.status == "PENDING":
            return Response({"message": "Ya existe una invitación pendiente"}, status=200)

        return Response({"message": f"¡Invitación enviada a @{to_user.username}!"}, status=201)


class ManageTripInvitesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invites = TripInvite.objects.filter(
            to_user=request.user,
            status="PENDING"
        ).select_related("from_user", "place")

        return Response([
            {
                "id": i.id,
                "from_user": {
                    "id": i.from_user.id,
                    "username": i.from_user.username
                },
                "place": {
                    "id": i.place.id,
                    "name": i.place.name,
                    "country": i.place.country
                },
                "created_at": i.created_at
            }
            for i in invites
        ])

    def patch(self, request, invite_id):
        invite = get_object_or_404(TripInvite, id=invite_id, to_user=request.user)
        new_status = request.data.get("status")

        if new_status not in ["ACCEPTED", "DECLINED"]:
            return Response({"error": "Estado inválido"}, status=400)

        invite.status = new_status
        invite.save()
        return Response({"message": f"Invitación marcada como {new_status}"})


# =========================
# LISTA DE AMIGOS (HUB)
# =========================
class CompanionHubListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        connections = Companion.objects.filter(
            Q(user=user) | Q(companion=user),
            status="ACCEPTED"
        ).select_related("user", "companion")

        friend_list = []
        for c in connections:
            friend = c.companion if c.user == user else c.user
            friend_list.append({
                "id": friend.id,
                "username": friend.username,
                "avatar": friend.avatar.url if friend.avatar else None
            })
            
        return Response(friend_list, status=200)
