from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


@shared_task
def send_invoice_email(invoice_id):
    from .models import Invoice
    try:
        invoice = Invoice.objects.select_related('client', 'freelancer').get(id=invoice_id)
        portal_url = f"{settings.FRONTEND_URL}/portal/{invoice.id}/pay"
        subject = f"Invoice {invoice.invoice_number} from {invoice.freelancer.get_full_name() or invoice.freelancer.email}"
        message = f"""
Hello {invoice.client.name},

You have received a new invoice.

Invoice Number: {invoice.invoice_number}
Amount: {invoice.total} {invoice.client.currency}
Due Date: {invoice.due_date}

You can view and pay this invoice here:
{portal_url}

Thank you,
{invoice.freelancer.get_full_name() or invoice.freelancer.email}
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invoice.client.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending invoice email: {e}")


@shared_task
def send_payment_confirmation(invoice_id):
    from .models import Invoice
    try:
        invoice = Invoice.objects.select_related('client', 'freelancer').get(id=invoice_id)
        subject = f"Payment Received - Invoice {invoice.invoice_number}"
        message = f"""
Hello {invoice.client.name},

We have received your payment for Invoice {invoice.invoice_number}.

Amount Paid: {invoice.total} {invoice.client.currency}
Payment Date: {invoice.paid_at}

Thank you for your payment!

Best regards,
{invoice.freelancer.get_full_name() or invoice.freelancer.email}
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invoice.client.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending payment confirmation: {e}")


@shared_task
def check_overdue_invoices():
    from django.utils import timezone
    from .models import Invoice
    today = timezone.now().date()
    overdue_invoices = Invoice.objects.filter(
        status='SENT',
        due_date__lt=today
    )
    for invoice in overdue_invoices:
        invoice.status = 'OVERDUE'
        invoice.save()
        send_overdue_reminder.delay(invoice.id)


@shared_task
def send_overdue_reminder(invoice_id):
    from .models import Invoice
    try:
        invoice = Invoice.objects.select_related('client', 'freelancer').get(id=invoice_id)
        portal_url = f"{settings.FRONTEND_URL}/portal/{invoice.id}/pay"
        subject = f"Overdue Invoice Reminder - {invoice.invoice_number}"
        message = f"""
Hello {invoice.client.name},

This is a reminder that Invoice {invoice.invoice_number} is now overdue.

Invoice Number: {invoice.invoice_number}
Amount Due: {invoice.total} {invoice.client.currency}
Due Date: {invoice.due_date}

Please make the payment at your earliest convenience:
{portal_url}

Thank you,
{invoice.freelancer.get_full_name() or invoice.freelancer.email}
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invoice.client.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending overdue reminder: {e}")
