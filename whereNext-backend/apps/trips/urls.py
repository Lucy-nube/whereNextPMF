from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TripViewSet,
    TripPlaceViewSet,
    TripPlacesListCreateView,
    ReorderTripPlacesView,
    TripDetailPublicView,
    TripPhotoUploadView, 
    TripSuggestionsView,
    FeedTripsView,
    TripLikeToggleView, 
    TripCommentView

)

router = DefaultRouter()
router.register(r"", TripViewSet, basename="trips")  
router.register(r"trip-places", TripPlaceViewSet, basename="trip-places")

urlpatterns = [

    path("feed/", FeedTripsView.as_view(), name="trips-feed"),
    # ⭐ CRUD AUTOMÁTICO (primero SIEMPRE)
    path("", include(router.urls)),

    # ⭐ DETALLE DEL VIAJE (después del router)
    path("<int:trip_id>/", TripDetailPublicView.as_view()),

    # ⭐ NESTED
    path(
        "<int:trip_id>/places/",
        TripPlacesListCreateView.as_view(),
        name="trip-places-nested"
    ),

    path(
        "<int:trip_id>/reorder-places/",
        ReorderTripPlacesView.as_view(),
        name="reorder-trip-places"
    ),

    path(
        "<int:trip_id>/photos/",
        TripPhotoUploadView.as_view(),
        name="trip-photo-upload"
    ),

    path(
        "<int:trip_id>/suggestions/",
        TripSuggestionsView.as_view(),
        name="trip-suggestions"
    ),

    path("<int:trip_id>/like/", TripLikeToggleView.as_view(), name="trip-like"),
    path("<int:trip_id>/comments/", TripCommentView.as_view(), name="trip-comments"),
]


