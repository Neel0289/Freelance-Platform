from django.urls import path
from .views import FirebaseLoginView, UserProfileView

urlpatterns = [
    path('firebase/', FirebaseLoginView.as_view(), name='firebase_login'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
