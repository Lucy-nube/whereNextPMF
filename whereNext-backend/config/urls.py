from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.users.views import EmailOrUsernameTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    # =========================
    # ADMIN
    # =========================
    path("admin/", admin.site.urls),


    # =========================
    # APPS
    # =========================
    path("api/trips/", include("apps.trips.urls")),
    path("api/places/", include("apps.places.urls")),
    path("api/", include("apps.users.urls")),
    path("api/chats/", include("apps.social.chats.urls")),


    # =========================
    # AUTH (JWT)
    # =========================
    path("api/token/", EmailOrUsernameTokenObtainPairView.as_view()),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


# =========================
# MEDIA FILES (DEV)
# =========================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )