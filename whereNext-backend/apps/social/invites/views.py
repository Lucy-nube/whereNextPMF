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
    # LISTAR INVITACIONES
    # ============================
    def list(self, request, *args, **kwargs):
     invites = TripInvite.objects.filter(
         to_user=request.user,
         status="PENDING"
     )

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

        if to_user == request.user:
            return Response(
                {"error": "No puedes invitarte a ti misma"},
                status=400
            )

        existing = TripInvite.objects.filter(
            trip=trip,
            to_user=to_user
        ).first()

        if existing:
            return Response({"status": existing.status}, status=200)

        invite = TripInvite.objects.create(
            trip=trip,
            from_user=request.user,
            to_user=to_user,
            status="PENDING"
        )

        Notification.objects.filter(
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id,
        user=invite.to_user,
        notification_type="TRIP_INVITE"
        ).update(is_read=True)

        return Response(
            TripInviteSerializer(invite).data,
            status=201
        )

    # ============================
    # ACEPTAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        invite = get_object_or_404(TripInvite, id=pk)

        if invite.to_user != request.user:
            return Response({"error": "No autorizado"}, status=403)

        invite.status = "ACCEPTED"
        invite.save()

        trip = invite.trip
        trip.companions.add(invite.to_user)
        trip.save()

        Notification.objects.filter(
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id,
        user=invite.to_user,
        notification_type="TRIP_INVITE"
        ).update(is_read=True)

        return Response({"status": "ACCEPTED"}, status=200)

    # ============================
    # RECHAZAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        invite = get_object_or_404(TripInvite, id=pk)

        if invite.to_user != request.user:
            return Response({"error": "No autorizado"}, status=403)

        invite.status = "DECLINED"
        invite.save()

        Notification.objects.filter(
        content_type=ContentType.objects.get_for_model(invite),
        object_id=invite.id,
        user=invite.to_user,
        notification_type="TRIP_INVITE"
       ).delete()

        return Response({"status": "DECLINED"}, status=200)

    # ============================
    # CANCELAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
     invite = get_object_or_404(TripInvite, id=pk)

     # solo el creador puede cancelar
     if invite.from_user != request.user:
        return Response({"error": "No autorizado"}, status=403)

     invite.status = "CANCELLED"
     invite.save()

     # 🚨 ELIMINAR NOTIFICACIÓN RELACIONADA (ESTO ES LO QUE TE FALTA)
     Notification.objects.filter(
         content_type=ContentType.objects.get_for_model(invite),
         object_id=invite.id,
         user=invite.to_user,
         notification_type="TRIP_INVITE"
      ).delete()

     return Response({"status": "CANCELLED"}, status=200)