from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.social.companions.views import CompanionViewSet, IsCompanionView

router = DefaultRouter()
router.register("", CompanionViewSet, basename="companions")

urlpatterns = [
    path("", include(router.urls)),
    path("is/<int:user_id>/", IsCompanionView.as_view()),
    path("invites/", include("apps.social.invites.urls")),
    path("chats/", include("apps.social.chats.urls")),
    path("notifications/", include("apps.social.notifications.urls")),
]
