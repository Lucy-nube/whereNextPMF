from rest_framework.routers import DefaultRouter
from .views import TripInviteViewSet

router = DefaultRouter()
router.register(r"trip-invites", TripInviteViewSet, basename="trip-invites")

urlpatterns = router.urls
