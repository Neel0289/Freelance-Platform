from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.permissions import IsOwner
from .models import Project, TimeEntry, WorkRequest
from .serializers import ProjectSerializer, TimeEntrySerializer, WorkRequestSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'due_date']
    filterset_fields = ['status', 'client']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CLIENT':
            return Project.objects.filter(
                client__email__iexact=user.email,
                deleted_at__isnull=True
            ).select_related('client')
        return Project.objects.filter(
            freelancer=user,
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


class WorkRequestViewSet(viewsets.ModelViewSet):
    serializer_class = WorkRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        work_request = serializer.save()
        
        # Create notification for freelancer
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=work_request.freelancer,
            type='WORK_REQUEST',
            message=f"New work request from {work_request.client.get_full_name() or work_request.client.username}: {work_request.title}",
            data={'work_request_id': work_request.id}
        )


    def get_queryset(self):
        user = self.request.user
        if user.role == 'CLIENT':
            return WorkRequest.objects.filter(client=user)
        return WorkRequest.objects.filter(freelancer=user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Freelancer counter-proposes budget and deadline."""
        work_request = self.get_object()
        if work_request.freelancer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get budget and deadline from request
        budget = request.data.get('budget')
        deadline = request.data.get('deadline')

        if not budget or not deadline:
            return Response({'error': 'Budget and deadline are required'}, status=status.HTTP_400_BAD_VALUE)

        work_request.budget = budget
        work_request.deadline = deadline
        work_request.status = 'PROPOSED'
        work_request.save()
        
        # Notify the client about the proposal
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=work_request.client,
            message=f"Proposal for {work_request.title}: {request.user.get_full_name()} has proposed a budget of {budget} and deadline of {deadline}.",
            type='WORK_REQUEST',
            data={'work_request_id': work_request.id}
        )
        
        return Response({'status': 'Proposed'})

    @action(detail=True, methods=['post'])
    def client_accept(self, request, pk=None):
        """Client accepts the freelancer's proposal."""
        work_request = self.get_object()
        if work_request.client != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if work_request.status != 'PROPOSED':
            return Response({'error': 'Request must be in Proposed state'}, status=status.HTTP_400_BAD_VALUE)

        work_request.status = 'ACCEPTED'
        work_request.save()
        
        # Create a Client record for the freelancer if it doesn't exist
        from apps.clients.models import Client
        client_record, _ = Client.objects.get_or_create(
            freelancer=work_request.freelancer,
            email=work_request.client.email,
            defaults={
                'name': work_request.client.get_full_name() or work_request.client.username,
            }
        )

        # Create the project with status 'ACCEPTED'
        Project.objects.create(
            freelancer=work_request.freelancer,
            client=client_record,
            title=work_request.title,
            description=work_request.description,
            due_date=work_request.deadline,
            budget=work_request.budget,
            status='ACCEPTED'
        )

        # Notify the freelancer
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=work_request.freelancer,
            message=f"Project Accepted: {work_request.title}. {request.user.get_full_name()} has accepted your proposal.",
            type='WORK_REQUEST',
            data={'work_request_id': work_request.id}
        )
        
        return Response({'status': 'Accepted'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        work_request = self.get_object()
        if work_request.freelancer != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        work_request.status = 'DECLINED'
        work_request.save()
        return Response({'status': 'Declined'})
