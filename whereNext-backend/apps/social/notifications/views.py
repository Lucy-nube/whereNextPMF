from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from apps.social.notifications.models import Notification
from apps.social.companions.models import Companion
from apps.users.models import TripInvite  
from apps.social.notifications.serializers import NotificationSerializer




class NotificationListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).order_by("-created_at")

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)



class NotificationDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notif = get_object_or_404(Notification, id=pk, user=request.user)

        # marcar como leída
        notif.is_read = True
        notif.save()

        # ============================
        # ACCIONES SEGÚN EL TIPO
        # ============================

        # 1. Solicitud de compañero
        if notif.notification_type == "FRIEND_REQUEST":
            companion = get_object_or_404(Companion, id=notif.object_id)
            companion.status = "ACCEPTED"
            companion.save()
            return Response({"status": "friend_accepted"})

        # 2. Invitación a viaje (TripInvite real)
        if notif.notification_type == "INVITE":
            invite = get_object_or_404(TripInvite, id=notif.object_id)
            invite.status = "ACCEPTED"
            invite.save()
            return Response({"status": "trip_invite_accepted"})

        # 3. Solo marcar como leída
        return Response({"status": "read"})
