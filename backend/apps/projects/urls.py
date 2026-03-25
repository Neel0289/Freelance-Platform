from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, WorkRequestViewSet

router = DefaultRouter()
router.register('work-requests', WorkRequestViewSet, basename='work-request')
router.register('', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
