from django.urls import path
from .views import GoogleLogin, UserProfileView

urlpatterns = [
    path('', GoogleLogin.as_view(), name='google_login'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
