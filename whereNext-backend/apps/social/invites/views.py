from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.contrib.contenttypes.models import ContentType

from apps.trips.models import Trip
from apps.social.notifications.models import Notification
from django.contrib.auth import get_user_model

from apps.users.models import TripInvite
from apps.users.serializers import TripInviteSerializer

User = get_user_model()


class TripInviteViewSet(viewsets.ModelViewSet):
    queryset = TripInvite.objects.all()
    serializer_class = TripInviteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # ============================
    # SOLO VER MIS INVITACIONES
    # ============================
    def list(self, request, *args, **kwargs):
        invites = TripInvite.objects.filter(to_user=request.user)
        serializer = TripInviteSerializer(invites, many=True)
        return Response(serializer.data)

    # ============================
    # CREAR INVITACIÓN
    # ============================
    def create(self, request, *args, **kwargs):
        trip_id = request.data.get("trip")
        to_user_id = request.data.get("to_user")

        trip = get_object_or_404(Trip, id=trip_id)
        to_user = get_object_or_404(User, id=to_user_id)

        # No invitarse a mi misma :)
        if to_user == request.user:
            return Response({"error": "No puedes invitarte a ti misma"}, status=400)

        # No duplicar invitaciones
        existing = TripInvite.objects.filter(trip=trip, to_user=to_user).first()
        if existing:
            return Response({"status": existing.status}, status=200)

        invite = TripInvite.objects.create(
            trip=trip,
            from_user=request.user,
            to_user=to_user,
            status="PENDING"
        )

        # Crear notificación
        Notification.objects.create(
            user=to_user,
            from_user=request.user,
            notification_type="TRIP_INVITE",
            text_preview=f"{request.user.username} te invitó a un viaje.",
            content_type=ContentType.objects.get_for_model(invite),
            object_id=invite.id
        )

        return Response(TripInviteSerializer(invite).data, status=201)

    # ============================
    # ACEPTAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
     invite = get_object_or_404(TripInvite, id=pk)

     if invite.to_user != request.user:
        return Response({"error": "No autorizado"}, status=403)

    # 1) Cambiar estado
     invite.status = "ACCEPTED"
     invite.save()

     # 2) Agregar al usuario al viaje
     trip = invite.trip
     trip.companions.add(invite.to_user)
     trip.save()

    # 3) Notificar al creador del viaje
     Notification.objects.create(
        user=invite.from_user,
        from_user=request.user,
        notification_type="INVITE_ACCEPTED",
        text_preview=f"{request.user.username} aceptó tu invitación.",
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id
    )

     return Response({"status": "ACCEPTED"}, status=200)


    # ============================
    # RECHAZAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
     invite = get_object_or_404(TripInvite, id=pk)

     if invite.to_user != request.user:
        return Response({"error": "No autorizado"}, status=403)

     # 1) Cambiar estado
     invite.status = "DECLINED"
     invite.save()

     # 2) Notificar al creador del viaje
     Notification.objects.create(
        user=invite.from_user,              # dueño del viaje
        from_user=request.user,             # quien rechazó
        notification_type="INVITE_DECLINED",
        text_preview=f"{request.user.username} rechazó tu invitación.",
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id
     )

     return Response({"status": "DECLINED"}, status=200)
 
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
     invite = get_object_or_404(TripInvite, id=pk)

     # Solo el creador del viaje puede cancelar
     if invite.from_user != request.user:
        return Response({"error": "No autorizado"}, status=403)

    # 1) Cambiar estado
     invite.status = "CANCELLED"
     invite.save()

    # 2) Notificar al usuario invitado
     Notification.objects.create(
        user=invite.to_user,
        from_user=request.user,
        notification_type="INVITE_CANCELLED",
        text_preview=f"{request.user.username} canceló la invitación al viaje.",
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id
     )

     return Response({"status": "CANCELLED"}, status=200)

