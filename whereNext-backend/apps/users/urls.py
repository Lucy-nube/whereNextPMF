from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EmailOrUsernameTokenObtainPairView,
    MeView,
    CompanionViewSet,
    FeedTripsView,
    PublicUserView,
    UsersearchView,
    IsCompanionView,
    CompanionHubListView,
    NotificationListView
)

# =========================
# ROUTER
# =========================
router = DefaultRouter()
router.register(r"companions", CompanionViewSet, basename="companions")

# =========================
# URLS
# =========================
urlpatterns = [

    # =========================
    # AUTH / USER
    # =========================
    path("token/", EmailOrUsernameTokenObtainPairView.as_view(), name="token"),
    path("me/", MeView.as_view(), name="me"),

    # =========================
    # SOCIAL CORE
    # =========================
    path("feed/", FeedTripsView.as_view(), name="feed"),
    path("search/", UsersearchView.as_view(), name="user-search"),
    path("users/<int:user_id>/", PublicUserView.as_view(), name="public-user"),
    path("is-companion/<int:user_id>/", IsCompanionView.as_view(), name="is-companion"),

    path("notifications/", NotificationListView.as_view(), name="notifications"),

    # =========================
    # HUB (RELACIONES)
    # =========================
    path("companions/hub/", CompanionHubListView.as_view(), name="companions-hub"),

   

    # =========================
    # ROUTER (CRUD companions)
    # =========================
    path("", include(router.urls)),
]