
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        messages = Message.objects.filter(room__id=room_id).order_by("created_at")

        data = [
            {
                "id": m.id,
                "user": m.sender.username,
                "message": m.text,
                "created_at": m.created_at,
            }
            for m in messages
        ]

        return Response(data)


