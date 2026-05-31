from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.users.views import EmailOrUsernameTokenObtainPairView



urlpatterns = [
    path("admin/", admin.site.urls),

    # =========================================================
    # ✈️ WHERENEXT ACTIVE APPS REGISTRY
    # =========================================================
    path("api/trips/", include("apps.trips.urls")),
    path("api/places/", include("apps.places.urls")),
    path("api/users/", include("apps.users.urls")),
    path("api/companions/", include("apps.social.companions.urls")),
    path("api/social/notifications/", include("apps.social.notifications.urls")),
    
    
    path("api/chats/", include("apps.social.chats.urls")),

    # AUTHENTICATION HOOKS
    path("api/token/", EmailOrUsernameTokenObtainPairView.as_view()),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/stamps/", include("apps.social.stamps.urls")),
    path("api/", include("apps.social.invites.urls")),




]


# MEDIA CHANNELS
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

