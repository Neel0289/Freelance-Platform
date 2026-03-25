import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.invoices.models import Invoice

try:
    invoice = Invoice.objects.get(id=4)
    print(f"Invoice 4 exists. Client email: '{invoice.client.email}'")
    
    user = User.objects.get(email='clasherscode6@gmail.com')
    print(f"User exists. Email: '{user.email}'")
    
    # Test strict equality
    print(f"Are emails exactly equal? {invoice.client.email == user.email}")
    
    # Test the filter
    qs = Invoice.objects.filter(client__email=user.email)
    print(f"Filter client__email=user.email count: {qs.count()}")
    
    # Wait, check if there are any case sensitivity issues
    qs_iexact = Invoice.objects.filter(client__email__iexact=user.email)
    print(f"Filter client__email__iexact=user.email count: {qs_iexact.count()}")

    # Try filtering by client__user matching the user (if Client has a user field)
    if hasattr(invoice.client, 'user'):
        if invoice.client.user:
            print(f"Client has linked User: {invoice.client.user.email}")
            qs_user = Invoice.objects.filter(client__user=user)
            print(f"Filter client__user=user count: {qs_user.count()}")
        else:
            print("Client has NO linked User object!")
            
except Exception as e:
    print(f"Error: {e}")
