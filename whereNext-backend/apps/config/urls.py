from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # -------------------
    # APPS
    # -------------------
    path("api/trips/", include("apps.trips.urls")),
    path("api/places/", include("apps.places.urls")),
    path("api/", include("users.urls")),

    # -------------------
    # JWT AUTH
    # -------------------
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
