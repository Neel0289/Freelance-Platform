import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.contracts.models import Contract
from apps.projects.models import Project
from apps.invoices.models import Invoice

def debug_client_stats(email):
    print(f"Debugging stats for email: {email}")
    
    projects = Project.objects.filter(client__email=email)
    print(f"Projects found: {projects.count()}")
    for p in projects:
        print(f"  - Project: {p.title}, Status: {p.status}")

    invoices = Invoice.objects.filter(client__email=email)
    print(f"Invoices found: {invoices.count()}")
    for inv in invoices:
        print(f"  - Invoice: {inv.invoice_number}, Status: {inv.status}, Total: {inv.total}")

    contracts = Contract.objects.filter(client__email=email)
    print(f"Contracts found: {contracts.count()}")
    for c in contracts:
        print(f"  - Contract: {c.title}, Status: {c.status}")

if __name__ == "__main__":
    # Test with likely portal users
    users = User.objects.filter(role='CLIENT')
    for u in users:
        debug_client_stats(u.email)
        print("-" * 20)
    
    # Also check if there are any contracts at all
    print(f"Total contracts in system: {Contract.objects.count()}")
    for c in Contract.objects.all():
         print(f"Contract: {c.title}, Status: {c.status}, Client Email: {c.client.email}")
