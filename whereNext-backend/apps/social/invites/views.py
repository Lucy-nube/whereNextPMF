from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import action
from django.contrib.contenttypes.models import ContentType

from .models import Companion
from .serializers import CompanionSerializer
from apps.social.notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


class CompanionViewSet(viewsets.ModelViewSet):
    serializer_class = CompanionSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Companion.objects.filter(
            Q(user=self.request.user) | Q(companion=self.request.user)
        )

    # ============================
    # LISTA DE AMIGOS LIMPIA
    # ============================
    def list(self, request, *args, **kwargs):
        current_user = request.user

        friendships = Companion.objects.filter(
            Q(user=current_user) | Q(companion=current_user),
            status="ACCEPTED"
        ).select_related("user", "companion", "user__profile", "companion__profile")

        clean = []
        for f in friendships:
            friend = f.companion if f.user == current_user else f.user

            clean.append({
                "id": friend.id,
                "username": friend.username,
                "avatar": friend.profile.avatar.url if hasattr(friend, "profile") and friend.profile.avatar else None
            })

        return Response(clean, status=200)

    # ============================
    # BLOQUEAR CREATE DIRECTO
    # ============================
    def create(self, request, *args, **kwargs):
        return Response(
            {"error": "Usa /invite/<user_id>/ para enviar solicitudes"},
            status=400
        )

    # ============================
    # INVITE (NORMALIZADO)
    # ============================
    @action(detail=False, methods=["post"], url_path="invite/(?P<user_id>[0-9]+)")
    def invite(self, request, user_id=None):
        target = get_object_or_404(User, id=user_id)

        if target == request.user:
            return Response({"error": "No puedes agregarte a ti misma"}, status=400)

        # NORMALIZAR ORDEN
        u1 = min(request.user.id, target.id)
        u2 = max(request.user.id, target.id)

        # BUSCAR O CREAR RELACIÓN ÚNICA
        instance, created = Companion.objects.get_or_create(
            user_id=u1,
            companion_id=u2,
            defaults={"status": "PENDING"}
        )

        # SI YA EXISTE → DEVOLVER ESTADO
        if not created:
            return Response({"status": instance.status}, status=200)

        # CREAR NOTIFICACIÓN
        Notification.objects.create(
            user=target,
            from_user=request.user,
            notification_type="FRIEND_REQUEST",
            text_preview=f"{request.user.username} te ha enviado una solicitud de compañero.",
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )

        return Response({"status": "PENDING", "id": instance.id}, status=201)

    # ============================
    # ACCEPT
    # ============================
    @action(detail=False, methods=["post"], url_path="accept/(?P<request_id>[0-9]+)")
    def accept(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id)

        # VALIDAR QUE EL QUE ACEPTA SEA EL DESTINATARIO REAL
        if request.user.id not in [instance.user_id, instance.companion_id]:
            return Response({"error": "No autorizado"}, status=403)

        instance.status = "ACCEPTED"
        instance.save()

        # NOTIFICAR AL OTRO USUARIO
        other = instance.user if instance.companion == request.user else instance.companion

        Notification.objects.create(
            user=other,
            from_user=request.user,
            notification_type="FRIEND_ACCEPTED",
            text_preview=f"{request.user.username} ha aceptado tu solicitud.",
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )

        return Response({"status": "ACCEPTED"}, status=200)

    # ============================
    # REJECT
    # ============================
    @action(detail=False, methods=["post"], url_path="reject/(?P<request_id>[0-9]+)")
    def reject(self, request, request_id=None):
        instance = get_object_or_404(Companion, id=request_id)

        if request.user.id not in [instance.user_id, instance.companion_id]:
            return Response({"error": "No autorizado"}, status=403)

        other = instance.user if instance.companion == request.user else instance.companion

        Notification.objects.create(
            user=other,
            from_user=request.user,
            notification_type="FRIEND_REJECTED",
            text_preview=f"{request.user.username} ha rechazado tu solicitud.",
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )

        instance.delete()
        return Response({"status": "REMOVED"}, status=200)
