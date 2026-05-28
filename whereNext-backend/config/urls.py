from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.users.views import EmailOrUsernameTokenObtainPairView


# Open config/urls.py and update your APPS block row array

# Abre tu archivo config/urls.py y modifica la línea de chats por esta versión exacta:

# Open config/urls.py and synchronize your active apps definitions list

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
    
    # 🚀 THE CRITICAL BACKEND MATRIX SYNC:
    # Points directly to your inner nested app path while keeping the 
    # clean /api/chats/ URL layout perfectly matching your React requests!
    path("api/chats/", include("apps.social.chats.urls")),

    # AUTHENTICATION HOOKS
    path("api/token/", EmailOrUsernameTokenObtainPairView.as_view()),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


# MEDIA CHANNELS
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

