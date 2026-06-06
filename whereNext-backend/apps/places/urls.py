from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet,
    PlaceCommentCreateView,
    PlaceLikeToggleView,
    PlaceRateView,
    FavoritePlacesListView,
)

router = DefaultRouter()
router.register(r"", PlaceViewSet, basename="places")

urlpatterns = [
    path("<int:place_id>/comments/", PlaceCommentCreateView.as_view(), name="place-comments"),
    path("<int:place_id>/like/", PlaceLikeToggleView.as_view(), name="place-like"),
    path("<int:place_id>/rate/", PlaceRateView.as_view(), name="place-rate"),
    path("favorites/", FavoritePlacesListView.as_view(), name="favorites"),

]

urlpatterns += router.urls
