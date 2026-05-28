from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanionViewSet, companionsHubView

router = DefaultRouter()
router.register("", CompanionViewSet, basename="companions")

urlpatterns = [
    path("hub/", companionsHubView.as_view()),
    path("", include(router.urls)),
]
