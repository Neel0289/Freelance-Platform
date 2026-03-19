from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_contract_email(contract_id):
    from .models import Contract
    try:
        contract = Contract.objects.select_related('client', 'freelancer').get(id=contract_id)
        signing_url = f"{settings.FRONTEND_URL}/portal/contracts/sign/{contract.signature_token}"
        subject = f"Contract: {contract.title} - Please Review and Sign"
        message = f"""
Hello {contract.client.name},

You have received a contract for review and signing.

Contract: {contract.title}

Please review and sign the contract here:
{signing_url}

Thank you,
{contract.freelancer.get_full_name() or contract.freelancer.email}
        """
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[contract.client.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending contract email: {e}")
