from django.urls import path
from .views import ChatMessagesView, ChatListView, MarkChatAsReadView

urlpatterns = [
    # 🚀 Handles base routing for 'GET /api/chats/' to safely drive the side panel inbox list
    path("", ChatListView.as_view(), name="chat-list"),
    
    # Handles dynamic room parameters 'GET /api/chats/<id>/messages/'
    path("<int:room_id>/messages/", ChatMessagesView.as_view(), name="chat-messages"),
    
    # Handles marking operations
    path("<str:room_name>/read/", MarkChatAsReadView.as_view(), name="chat-mark-read"),
]
