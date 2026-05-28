from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TripViewSet,
    TripPlaceViewSet,
    TripPlacesListCreateView,
    ReorderTripPlacesView,
    ExploreTripsView,
    FeedTripsView,
    TripDetailPublicView,
    TripPhotoUploadView,
    TripSuggestionsView
)

# 🚀 REST FRAMEWORK PIPELINE MATRIX
router = DefaultRouter()

# FIXED BOUNDARY: Setting this string layout parameter to clean empty markers 
# maps your @action methods natively to /api/trips/<id>/like/ and /api/trips/<id>/comment/
router.register(r"", TripViewSet, basename="trip")

urlpatterns = [
    # Static endpoints
    path("feed/", FeedTripsView.as_view(), name="trip-feed"),
    path("explore/", ExploreTripsView.as_view(), name="trip-explore"),
    path("public/<int:trip_id>/", TripDetailPublicView.as_view(), name="trip-public-detail"),
    
    # Multimedia upload and suggestions configurations
    path("<int:trip_id>/upload-photo/", TripPhotoUploadView.as_view(), name="trip-photo-upload"),
    path("<int:trip_id>/suggestions/", TripSuggestionsView.as_view(), name="trip-suggestions"),

    # Nested itinerary points routing entries
    path("<int:trip_id>/places/", TripPlacesListCreateView.as_view(), name="trip-places-list-create"),
    path("<int:trip_id>/reorder/", ReorderTripPlacesView.as_view(), name="trip-reorder-places"),

    # Automatic Router Include (Leave this trailing at the absolute bottom layer)
    path("", include(router.urls)),
]
