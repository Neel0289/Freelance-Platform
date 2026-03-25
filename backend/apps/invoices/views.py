import hashlib
import hmac
import json
from decimal import Decimal

import razorpay
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.users.permissions import IsOwner, IsParticipant
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsParticipant]
    search_fields = ['invoice_number', 'client__name']
    ordering_fields = ['invoice_number', 'created_at', 'due_date', 'total']
    filterset_fields = ['status', 'client', 'project']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CLIENT':
            return Invoice.objects.filter(
                client__email__iexact=user.email
            ).select_related('client', 'project').prefetch_related('items')
        return Invoice.objects.filter(
            freelancer=user
        ).select_related('client', 'project').prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'DRAFT':
            invoice.status = 'SENT'
            invoice.save()
            # Trigger email asynchronously
            from apps.invoices.tasks import send_invoice_email
            try:
                send_invoice_email.delay(invoice.id)
            except Exception:
                # Celery may not be running in dev
                send_invoice_email(invoice.id)
            return Response({'message': 'Invoice sent successfully'})
        return Response(
            {'error': 'Only draft invoices can be sent'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'], url_path='create-order')
    def create_order(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ['SENT', 'OVERDUE']:
            return Response(
                {'error': 'Invoice must be sent before payment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            order_data = {
                'amount': int(invoice.total * 100),  # Amount in paise
                'currency': 'INR',
                'receipt': invoice.invoice_number,
                'notes': {
                    'invoice_id': str(invoice.id),
                    'invoice_number': invoice.invoice_number,
                }
            }
            order = client.order.create(data=order_data)
            invoice.razorpay_order_id = order['id']
            invoice.save()

            return Response({
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request, pk=None):
        invoice = self.get_object()
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'Missing payment details'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })

            invoice.razorpay_payment_id = razorpay_payment_id
            invoice.status = 'PAID'
            invoice.paid_at = timezone.now()
            invoice.save()

            # Send payment confirmation email
            from apps.invoices.tasks import send_payment_confirmation
            try:
                send_payment_confirmation.delay(invoice.id)
            except Exception:
                send_payment_confirmation(invoice.id)

            return Response({'message': 'Payment verified successfully'})
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Invalid payment signature'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], url_path='pdf')
    def download_pdf(self, request, pk=None):
        from .pdf import generate_invoice_pdf
        invoice = self.get_object()
        response = generate_invoice_pdf(invoice)
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """Handle Razorpay webhook for payment.captured event."""
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    webhook_signature = request.headers.get('X-Razorpay-Signature', '')
    webhook_body = request.body.decode('utf-8')

    try:
        expected_signature = hmac.new(
            key=webhook_secret.encode('utf-8'),
            msg=webhook_body.encode('utf-8'),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, webhook_signature):
            return Response({'error': 'Invalid signature'}, status=400)
    except Exception:
        return Response({'error': 'Signature verification failed'}, status=400)

    payload = json.loads(webhook_body)
    event = payload.get('event')

    if event == 'payment.captured':
        payment = payload['payload']['payment']['entity']
        order_id = payment.get('order_id')

        try:
            invoice = Invoice.objects.get(razorpay_order_id=order_id)
            if invoice.status != 'PAID':
                invoice.status = 'PAID'
                invoice.razorpay_payment_id = payment['id']
                invoice.paid_at = timezone.now()
                invoice.save()
        except Invoice.DoesNotExist:
            pass

    return Response({'status': 'ok'})
