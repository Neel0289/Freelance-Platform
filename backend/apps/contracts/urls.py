from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContractViewSet, sign_contract

router = DefaultRouter()
router.register('', ContractViewSet, basename='contract')

urlpatterns = [
    path('sign/<uuid:token>/', sign_contract, name='sign_contract'),
    path('', include(router.urls)),
]
