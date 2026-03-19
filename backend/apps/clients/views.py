from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsOwner
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['name', 'created_at']
    filterset_fields = ['currency']

    def get_queryset(self):
        return Client.objects.filter(
            freelancer=self.request.user,
            deleted_at__isnull=True
        )

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.deleted_at = timezone.now()
        instance.save()
