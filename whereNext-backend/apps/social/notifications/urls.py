from django.urls import path
from .views import NotificationListView, NotificationDetailView, NotificationMarkAllReadView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("<int:pk>/mark_read/", NotificationDetailView.as_view(), name="notification-mark-read"),
    path("read_all/", NotificationMarkAllReadView.as_view()),
]
