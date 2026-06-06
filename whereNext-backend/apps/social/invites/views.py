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
from apps.social.invites.serializers import TripInviteSerializer

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
     trip_id = request.query_params.get("trip")

     invites = TripInvite.objects.filter(
        from_user=request.user
     ) | TripInvite.objects.filter(
        to_user=request.user
     )

     if trip_id:
        invites = invites.filter(trip_id=trip_id)

     serializer = TripInviteSerializer(invites, many=True, context={"request": request})
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

        # Si existe pero NO está pendiente → borrar y crear una nueva
        if existing and existing.status != "PENDING":
            existing.delete()
            existing = None

        # Si existe y está pendiente → devolverla
        if existing:
            return Response(TripInviteSerializer(existing).data, status=200)
        invite = TripInvite.objects.create(
            trip=trip,
            from_user=request.user,
            to_user=to_user,
            status="PENDING"
        )


        return Response(
        TripInviteSerializer(invite, context={"request": request}).data,
         status=201
        ) 


    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
     invite = get_object_or_404(TripInvite, id=pk)

     # Solo el usuario invitado puede aceptar
     if invite.to_user != request.user:
        return Response({"error": "No autorizado"}, status=403)

     # Cambiar estado
     invite.status = "ACCEPTED"
     invite.save()

     # Añadir acompañante al viaje
     trip = invite.trip
     trip.companions.add(invite.to_user)
     trip.save()

     # Serializar invitación actualizada
     invite_data = TripInviteSerializer(invite, context={"request": request}).data

     # Serializar viaje actualizado
     from apps.trips.serializers import TripSerializer
     trip_data = TripSerializer(trip, context={"request": request}).data

     # ⭐ DEVOLVER AMBAS COSAS ⭐
     return Response({
         "invite": invite_data,
         "trip": trip_data
     }, status=200)

    
    # ============================
    # RECHAZAR INVITACIÓN
    # ============================
    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        invite = get_object_or_404(TripInvite, id=pk)

        if invite.to_user != request.user:
            return Response({"error": "No autorizado"}, status=403)

        # Cambiar estado
        invite.status = "DECLINED"
        invite.save()

        # ⭐ Notificar al dueño del viaje
        Notification.objects.create(
            user=invite.from_user,              # dueño del viaje
            from_user=request.user,             # quien rechazó
            notification_type="INVITE_DECLINED",
            text_preview=f"{request.user.username} rechazó tu invitación al viaje '{invite.trip.title}'.",
            content_type=ContentType.objects.get_for_model(invite),
            object_id=invite.id
        )

        # ⭐ Devolver la invitación completa
        return Response(
      TripInviteSerializer(invite, context={"request": request}).data,
      status=200
      )




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
        
        TripInviteSerializer(invite, context={"request": request})


        return Response({"status": "CANCELLED"}, status=200)