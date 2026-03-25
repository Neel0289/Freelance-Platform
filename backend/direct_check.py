import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.contracts.models import Contract
from apps.invoices.models import Invoice

email = 'client@test.com'
print(f"Direct Check for {email}")
c_count = Contract.objects.filter(client__email__iexact=email).count()
print(f"Contract Count (iexact): {c_count}")
if c_count > 0:
    for c in Contract.objects.filter(client__email__iexact=email):
        print(f" - {c.title}: {c.status}")

inv_count = Invoice.objects.filter(client__email__iexact=email).count()
print(f"Invoice Count (iexact): {inv_count}")
