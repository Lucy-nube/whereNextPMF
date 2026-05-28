from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import TripInvite
from .serializers import TripInviteSerializer
from apps.social.notifications.models import Notification
from rest_framework.decorators import action



class TripInviteViewSet(viewsets.ModelViewSet):
    serializer_class = TripInviteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TripInvite.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).select_related("from_user", "to_user", "place")

    # ============================
    # CREATE INVITE
    # ============================
    def perform_create(self, serializer):
        invite = serializer.save(from_user=self.request.user)

        # Crear notificación
        Notification.objects.create(
            user=invite.to_user,
            sender=self.request.user,
            type="INVITE",
            text=f"{self.request.user.username} te invitó a un viaje a {invite.place.name}"
        )

    # ============================
    # ACCEPT INVITE
    # ============================
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        invite = self.get_object()

        if invite.to_user != request.user:
            return Response({"error": "No autorizado"}, status=403)

        invite.status = "ACCEPTED"
        invite.save()

        # Notificación
        Notification.objects.create(
            user=invite.from_user,
            sender=request.user,
            type="INVITE_ACCEPTED",
            text=f"{request.user.username} aceptó tu invitación"
        )

        return Response({"status": "ACCEPTED"})

    # ============================
    # DECLINE INVITE
    # ============================
    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        invite = self.get_object()

        if invite.to_user != request.user:
            return Response({"error": "No autorizado"}, status=403)

        invite.status = "DECLINED"
        invite.save()

        return Response({"status": "DECLINED"})
