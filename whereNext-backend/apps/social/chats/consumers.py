import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken

from apps.social.chats.models import ChatRoom, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f"chat_{self.room_id}"

        # Extract JWT token from query params
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        token_value = None

        if "token=" in query_string:
            try:
                token_parts = query_string.split("token=")
                if len(token_parts) > 1:
                    raw_token = token_parts[1]
                    token_value = raw_token.split("&")[0]
            except Exception:
                token_value = None

        # Authenticate user
        self.scope["user"] = await self.get_user_from_jwt(token_value)

        # Join WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        message_text = data.get("message", "").strip()
        receiver_id = data.get("receiver")

        if not message_text:
            return

        user = self.scope["user"]

        if not user or not user.is_authenticated:
            print("⚠️ Message dropped: unauthenticated user.")
            return

        # Get receiver user
        receiver = await database_sync_to_async(User.objects.get)(id=receiver_id)

        # Save message in DB
        saved_msg = await self.save_message_to_db(
            sender=user,
            receiver=receiver,
            text=message_text
        )

        # Broadcast message to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": saved_msg.id,
                "message": message_text,
                "sender_id": user.id,
                "sender_username": user.username,
                "receiver_id": receiver.id,
                "timestamp": saved_msg.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "id": event["id"],
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_username": event["sender_username"],
            "receiver_id": event["receiver_id"],
            "timestamp": event["timestamp"],
        }))

    @database_sync_to_async
    def get_user_from_jwt(self, token_string):
        from django.contrib.auth.models import AnonymousUser

        if not token_string:
            return AnonymousUser()

        try:
            UntypedToken(token_string)
            decoded_payload = jwt.decode(token_string, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_payload.get("user_id")
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"JWT Auth error: {e}")
            return AnonymousUser()

    @database_sync_to_async
    def save_message_to_db(self, sender, receiver, text):
     # Intentar obtener la sala por ID de la URL
     try:
        room = ChatRoom.objects.get(id=self.room_id)
     except ChatRoom.DoesNotExist:
        #  DEBO ACORDARME Si no existe, crear una nueva sala y añadir a ambos usuarios
        room = ChatRoom.objects.create()
        room.users.add(sender, receiver)
        room.save()

     # Crear el mensaje
     return Message.objects.create(
        room=room,
        sender=sender,
        receiver=receiver,
        text=text
    )

