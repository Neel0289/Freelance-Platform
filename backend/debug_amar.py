import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.contracts.models import Contract
from apps.invoices.models import Invoice

email = 'amar@gmail.com'
print(f"Stats for {email}:")
invoices = Invoice.objects.filter(client__email=email)
print(f"Invoices: {invoices.count()}")
for inv in invoices:
    print(f"  {inv.invoice_number}: {inv.status}, {inv.total}")

contracts = Contract.objects.filter(client__email=email)
print(f"Contracts: {contracts.count()}")
for c in contracts:
    print(f"  {c.title}: {c.status}")

# Also check for case sensitivity
contracts_low = Contract.objects.filter(client__email__iexact=email)
print(f"Contracts (iexact): {contracts_low.count()}")

# CHECK THE USER ROLE TOO
user = User.objects.filter(email=email).first()
if user:
    print(f"User Role: {user.role}")
else:
    print("User NOT FOUND")
