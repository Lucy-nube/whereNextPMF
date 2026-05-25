from django.urls import path
from .views import InviteViewSet

urlpatterns = [
    path("", InviteViewSet.as_view({
        "get": "list",
        "post": "create"
    })),

    path("<int:pk>/", InviteViewSet.as_view({
        "patch": "partial_update",
        "get": "retrieve"
    })),
]
