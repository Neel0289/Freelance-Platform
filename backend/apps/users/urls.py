from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FirebaseLoginView, UserProfileView, FreelancerViewSet

router = DefaultRouter()
router.register('freelancers', FreelancerViewSet, basename='freelancer')

urlpatterns = [
    path('', include(router.urls)),
    path('firebase/', FirebaseLoginView.as_view(), name='firebase_login'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
