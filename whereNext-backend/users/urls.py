from django.urls import path, include
from rest_framework.routers import DefaultRouter
# 🚀 IMPORTANTE: Eliminamos CompanionHubListView de aquí arriba para romper el bucle circular
from .views import (
    EmailOrUsernameTokenObtainPairView,
    MeView,
    CompanionViewSet,
    FeedTripsView,
    PublicUserView,
    UserTripsView, 
    UsersearchView,
    IsCompanionView,
    SendTripInviteView,
    ManageTripInvitesView
)
# 🚀 TRUCO DE INYECCIÓN LIMPIA: Importamos la vista aquí de forma aislada
from . import views 

# =========================
# ROUTER
# =========================
router = DefaultRouter()
router.register(r"companions", CompanionViewSet, basename="companions")

# =========================
# URLPATTERNS BLINDADO
# =========================
urlpatterns = [
    # 🚀 ENLACE EXCLUSIVO: Llamamos a la vista leyendo el módulo views cargado localmente
    path("companions/hub/", views.CompanionHubListView.as_view(), name="companion-hub-list"),

    # Router automático
    path("", include(router.urls)),

    # Auth
    path("token/", EmailOrUsernameTokenObtainPairView.as_view()),
    path("me/", MeView.as_view()),

    # =========================
    # SOCIAL FEATURES
    # =========================
    path("search/", UsersearchView.as_view(), name="user-search"),
    path("feed/", FeedTripsView.as_view()),
    path("is-companion/<int:user_id>/", IsCompanionView.as_view()),

    # Rutas dinámicas
    path("apps.users/<int:user_id>/", PublicUserView.as_view()),
    path("apps.users/<int:user_id>/trips/", UserTripsView.as_view()),

    # =========================
    # INVITES
    # =========================
    path("invites/send/", SendTripInviteView.as_view(), name="invite-send"),
    path("invites/manage/", ManageTripInvitesView.as_view(), name="invite-list"),
    path("invites/manage/<int:invite_id>/", ManageTripInvitesView.as_view(), name="invite-action"),
]
