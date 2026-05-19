from django.urls import path
from .views import EmailOrUsernameTokenObtainPairView, MeView


urlpatterns = [
    path("token/", EmailOrUsernameTokenObtainPairView.as_view()),
    path("me/", MeView.as_view()),
]
