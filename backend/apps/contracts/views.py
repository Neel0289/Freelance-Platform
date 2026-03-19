from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.users.permissions import IsOwner
from .models import Contract
from .serializers import ContractSerializer


class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    search_fields = ['title']
    ordering_fields = ['title', 'created_at']
    filterset_fields = ['status', 'client']

    def get_queryset(self):
        return Contract.objects.filter(
            freelancer=self.request.user
        ).select_related('client', 'project')

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        contract = self.get_object()
        if contract.status == 'DRAFT':
            contract.status = 'SENT'
            contract.save()
            # Send email with signing link
            from .tasks import send_contract_email
            try:
                send_contract_email.delay(contract.id)
            except Exception:
                send_contract_email(contract.id)
            return Response({'message': 'Contract sent successfully'})
        return Response(
            {'error': 'Only draft contracts can be sent'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def sign_contract(request, token):
    """Public endpoint for client to view and sign contract via token."""
    try:
        contract = Contract.objects.select_related('client', 'freelancer').get(
            signature_token=token
        )
    except Contract.DoesNotExist:
        return Response({'error': 'Contract not found'}, status=404)

    if request.method == 'GET':
        return Response({
            'title': contract.title,
            'content': contract.content,
            'status': contract.status,
            'freelancer_name': contract.freelancer.get_full_name() or contract.freelancer.email,
            'client_name': contract.client.name,
            'signed_at': contract.signed_at,
        })

    if request.method == 'POST':
        if contract.status == 'SIGNED':
            return Response({'error': 'Contract already signed'}, status=400)
        contract.status = 'SIGNED'
        contract.signed_at = timezone.now()
        contract.save()
        return Response({'message': 'Contract signed successfully'})
