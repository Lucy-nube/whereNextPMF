from django.urls import path
from .views import NotificationListView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("<int:notif_id>/", NotificationListView.as_view(), name="notification-read"),
]
