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
    TripSuggestionsView,
    TripPhotoViewSet
)

router = DefaultRouter()
router.register(r"", TripViewSet, basename="trip")
router.register(r"photos", TripPhotoViewSet, basename="photos")  

urlpatterns = [
    path("feed/", FeedTripsView.as_view(), name="trip-feed"),
    path("explore/", ExploreTripsView.as_view(), name="trip-explore"),
    path("public/<int:trip_id>/", TripDetailPublicView.as_view(), name="trip-public-detail"),

    path("<int:trip_id>/upload-photo/", TripPhotoUploadView.as_view(), name="trip-photo-upload"),
    path("<int:trip_id>/suggestions/", TripSuggestionsView.as_view(), name="trip-suggestions"),

    path("<int:trip_id>/places/", TripPlacesListCreateView.as_view(), name="trip-places-list-create"),
    path("<int:trip_id>/reorder/", ReorderTripPlacesView.as_view(), name="trip-reorder-places"),

    path("", include(router.urls)),  
]




