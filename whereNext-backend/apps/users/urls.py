from django.urls import path
from .views import (
    EmailOrUsernameTokenObtainPairView,
    MeView,
    PublicUserView,
    UsersearchView,
    RegisterView ,
    ProfileMeView
)
 



urlpatterns = [
    # AUTH
    path("token/", EmailOrUsernameTokenObtainPairView.as_view(), name="token"),

    # PROFILE
    path("me/", MeView.as_view(), name="me"),
    path("search/", UsersearchView.as_view(), name="user-search"),
    path("<int:user_id>/", PublicUserView.as_view(), name="public-user"),
    path("register/", RegisterView.as_view(), name="user-register"), 
     path("profile/", ProfileMeView.as_view(), name="profile"),


]
