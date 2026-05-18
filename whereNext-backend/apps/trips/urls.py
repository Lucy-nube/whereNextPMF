from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TripViewSet,
    TripPlaceViewSet,
    TripPlacesListCreateView,
    ReorderTripPlacesView
)

router = DefaultRouter()
router.register(r"trips", TripViewSet, basename="trips")
router.register(r"trip-places", TripPlaceViewSet, basename="trip-places")

urlpatterns = [
    # Router endpoints (CRUD automático)
    path("", include(router.urls)),

    # List + create places dentro de un trip
    path(
        "trips/<int:trip_id>/places/",
        TripPlacesListCreateView.as_view(),
        name="trip-places-nested"
    ),

    # 🔥 Reordenar places dentro de un trip
    path(
        "trips/<int:trip_id>/reorder-places/",
        ReorderTripPlacesView.as_view(),
        name="reorder-trip-places"
    ),
]