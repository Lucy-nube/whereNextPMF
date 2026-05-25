from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Invite
from .serializers import InviteSerializer
from apps.social.notifications.services import create_notification


class InviteViewSet(viewsets.ModelViewSet):
    serializer_class = InviteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 🔒 Solo invites del usuario logueado
        user = self.request.user
        return Invite.objects.filter(sender=user) | Invite.objects.filter(receiver=user)

    def perform_create(self, serializer):
        invite = serializer.save()

        # 🔔 Notificación al receptor
        create_notification(
            user=invite.receiver,
            type="invite",
            text=f"Tienes una invitación de {invite.sender.username}"
        )

    def perform_update(self, serializer):
        old = self.get_object()
        invite = serializer.save()

        # 🔥 Solo si cambia a aceptado
        if not old.accepted and invite.accepted:
            create_notification(
                user=invite.sender,
                type="invite_accepted",
                text=f"{invite.receiver.username} aceptó tu invitación"
            )