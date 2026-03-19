from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.permissions import IsOwner
from .models import Project, TimeEntry
from .serializers import ProjectSerializer, TimeEntrySerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'due_date']
    filterset_fields = ['status', 'client']

    def get_queryset(self):
        return Project.objects.filter(
            freelancer=self.request.user,
            deleted_at__isnull=True
        ).select_related('client')

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def perform_destroy(self, instance):
        from django.utils import timezone
        instance.deleted_at = timezone.now()
        instance.save()

    @action(detail=True, methods=['get', 'post'], url_path='time-entries')
    def time_entries(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            entries = project.time_entries.all()
            serializer = TimeEntrySerializer(entries, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = TimeEntrySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(project=project, freelancer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
