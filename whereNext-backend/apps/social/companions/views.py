from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Companion
from .serializers import CompanionSerializer

# IMPORTS FOR TRIPS CONNECTIONS
from apps.trips.models import Trip
from apps.trips.serializers import TripSerializer

User = get_user_model()


# =========================================================
# COMPANION CRUD + INVITE / ACCEPT / REJECT
# =========================================================
class CompanionViewSet(viewsets.ModelViewSet):
    serializer_class = CompanionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Companion.objects.filter(
            Q(user=self.request.user) | Q(companion=self.request.user)
        )

    # 🚀 MASTER ROOT LIST OVERRIDE: Targets GET /api/companions/ character-for-character
    def list(self, request, *args, **kwargs):
        """
        🛡️ IDENTITY BARRIER GATEWAY: Overrides standard outputs to return 
        strictly and exclusively a flat array list of approved friends profiles.
        It isolates Luz and prevents you from autoinviting yourself!
        """
        current_user = request.user

        # Fetch strictly accepted friend rows where the session traveler is a participant
        approved_friendships = Companion.objects.filter(
            Q(user=current_user) | Q(companion=current_user),
            status__iexact="ACCEPTED"
        ).select_related("user", "companion", "user__profile", "companion__profile")

        clean_friends_payload = []
        
        for friendship in approved_friendships:
            # 🛡️ IDENTITY DETECTOR: Determine which side of the table holds your friend's profile data
            if friendship.user == current_user:
                friend_account = friendship.companion
            else:
                friend_account = friendship.user

            # Fallback filter check: Safeguard against broken profiles or self-referencing links
            if not friend_account or friend_account == current_user:
                continue

            # Append an explicit, flat dictionary structure directly matching your React explore loop keys
            clean_friends_payload.append({
                "id": friend_account.id,
                "username": friend_account.username,
                "avatar": friend_account.profile.avatar.url if (hasattr(friend_account, "profile") and friend_account.profile.avatar) else None
            })

        return Response(clean_friends_payload, status=status.HTTP_200_OK)

    # Block traditional creation calls to enforce explicit actions parameters instead
    def create(self, request, *args, **kwargs):
        return Response(
            {"error": "Usa /invite/<user_id>/ para enviar solicitudes"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=["post"], url_path="invite/(?P<user_id>[0-9]+)")
    def invite(self, request, user_id=None):
        target = get_object_or_404(User, id=user_id)

        if target == request.user:
            return Response({"error": "No puedes agregarte a ti misma"}, status=status.HTTP_400_BAD_REQUEST)

        existing = Companion.objects.filter(
            Q(user=request.user, companion=target) |
            Q(user=target, companion=request.user)
        ).first()

        if existing:
            return Response({"status": existing.status}, status=status.HTTP_200_OK)

        instance = Companion.objects.create(
            user=request.user,
            companion=target,
            status="PENDING"
        )

        from apps.social.notifications.models import Notification
        Notification.objects.create(
            user=target,
            from_user=request.user,
            notification_type="FRIEND_REQUEST",
            text_preview=f"{request.user.username} te ha enviado una solicitud de compañero.",
            request_id=instance.id  
        )

        return Response({"status": "PENDING", "id": instance.id}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="accept/(?P<request_id>[0-9]+)")
    def accept(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id, companion=request.user)
        instance.status = "ACCEPTED"
        instance.save()

        from apps.social.notifications.models import Notification
        Notification.objects.create(
            user=instance.user,
            from_user=request.user,
            notification_type="FRIEND_ACCEPTED",
            text_preview=f"{request.user.username} ha aceptado tu solicitud.",
            request_id=instance.id
        )

        return Response({"status": "ACCEPTED"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="reject/(?P<request_id>[0-9]+)")
    def reject(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id, companion=request.user)

        from apps.social.notifications.models import Notification
        Notification.objects.create(
            user=instance.user,
            from_user=request.user,
            notification_type="FRIEND_REJECTED",
            text_preview=f"{request.user.username} ha rechazado tu solicitud.",
            request_id=instance.id
        )

        instance.delete()
        return Response({"status": "REMOVED"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="cancel/(?P<request_id>[0-9]+)")
    def cancel(self, request, request_id=None):
      """
       Permite cancelar una solicitud PENDING enviada por el usuario actual.
       """
      instance = get_object_or_404(
        Companion,
        id=request_id,
        user=request.user,  # Solo quien envió puede cancelar
        status="PENDING"
    )

      instance.delete()

      return Response({"status": "CANCELLED"}, status=status.HTTP_200_OK)

# =========================================================
# HUB DE COMPANIONS (PENDING / RECEIVED / FRIENDS)
# =========================================================
class companionsHubView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sent = Companion.objects.filter(user=request.user, status="PENDING")
        received = Companion.objects.filter(companion=request.user, status="PENDING")
        friends = Companion.objects.filter(
            status="ACCEPTED", user=request.user
        ) | Companion.objects.filter(
            status="ACCEPTED", companion=request.user
        )

        return Response({
            "sent": CompanionSerializer(sent, many=True).data,
            "received": CompanionSerializer(received, many=True).data,
            "friends": CompanionSerializer(friends, many=True).data,
        })


# =========================================================
# FEED DE VIAJES (AMIGOS + PÚBLICOS + PROPIOS)
# =========================================================
class FeedTripsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        friends_as_user = Companion.objects.filter(
            user=user, status="ACCEPTED"
        ).values_list("companion_id", flat=True)

        friends_as_companion = Companion.objects.filter(
            companion=user, status="ACCEPTED"
        ).values_list("user_id", flat=True)

        friend_ids = list(friends_as_user) + list(friends_as_companion)

        trips = Trip.objects.filter(
            Q(owner__id__in=friend_ids) |
            Q(is_public=True, owner__profile__is_private=False) |
            Q(owner=user)
        ).order_by("-created_at")

        serializer = TripSerializer(trips, many=True, context={"request": request})
        return Response(serializer.data)
