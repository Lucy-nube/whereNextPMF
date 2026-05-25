# =========================================================
# DJANGO
# =========================================================
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

# =========================================================
# DRF CORE
# =========================================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView

# =========================================================
# LOCAL IMPORTS
# =========================================================
from .authentication import EmailOrUsernameTokenObtainPairSerializer
from .models import Companion, TripInvite
from .serializers import CompanionSerializer

from apps.trips.models import Trip

User = get_user_model()

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

class PublicUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        is_friend = Companion.objects.filter(
            Q(user=request.user, companion=user) |
            Q(user=user, companion=request.user),
            status="ACCEPTED"
        ).exists()

        return Response({
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar.url if user.avatar else None,
            "bio": user.bio,
            "is_friend": is_friend
        })

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
                "avatar": u.avatar.url if u.avatar else None,
                "bio": u.bio or ""
            }
            for u in users
        ])
    
class CompanionViewSet(viewsets.ModelViewSet):
    serializer_class = CompanionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Companion.objects.filter(
            Q(user=self.request.user) |
            Q(companion=self.request.user)
        )

class CompanionHubListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        connections = Companion.objects.filter(
            Q(user=user) | Q(companion=user),
            status="ACCEPTED"
        ).select_related("user", "companion")

        return Response([
            {
                "id": (c.companion if c.user == user else c.user).id,
                "username": (c.companion if c.user == user else c.user).username,
                "avatar": (c.companion if c.user == user else c.user).avatar.url
                if (c.companion if c.user == user else c.user).avatar else None
            }
            for c in connections
        ])

class UserTripsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trips = Trip.objects.filter(owner=request.user)

        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "created_at": t.created_at,
                "is_public": t.is_public,
            }
            for t in trips
        ])
    
class IsCompanionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        is_friend = Companion.objects.filter(
            Q(user=request.user, companion_id=user_id, status="ACCEPTED") |
            Q(user_id=user_id, companion=request.user, status="ACCEPTED")
        ).exists()

        return Response({"is_companion": is_friend})
    
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = request.user.notifications.all().order_by("-created_at")

        return Response([
            {
                "id": n.id,
                "type": n.notification_type,
                "text": n.text_preview,
                "from_user": n.from_user.username,
                "created_at": n.created_at,
            }
            for n in notifications
        ])
    
