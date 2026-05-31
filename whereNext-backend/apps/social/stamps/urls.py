from django.urls import path
from .views import UserTravelStampsView

urlpatterns = [
    path("", UserTravelStampsView.as_view(), name="user-stamps"),
]
