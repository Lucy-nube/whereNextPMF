from django.urls import path
from .views import ChatMessagesView, ChatListView, MarkChatAsReadView

from .views import StartChatView

urlpatterns = [
    path("", ChatListView.as_view(), name="chat-list"),
    path("<int:room_id>/messages/", ChatMessagesView.as_view(), name="chat-messages"),
    path("<str:room_name>/read/", MarkChatAsReadView.as_view(), name="chat-mark-read"),
    path("start/<int:user_id>/", StartChatView.as_view(), name="chat-start"),
]
