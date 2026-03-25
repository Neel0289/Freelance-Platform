import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.contracts.models import Contract
from apps.projects.models import Project
from apps.invoices.models import Invoice
from apps.clients.models import Client

def debug_full(email):
    print(f"--- Full Debug for {email} ---")
    u = User.objects.filter(email=email).first()
    if u:
        print(f"User Role: {u.role}")
    else:
        print("User NOT FOUND")
        
    c_records = Client.objects.filter(email=email)
    print(f"Client Records: {c_records.count()}")
    for cr in c_records:
        print(f"  Record ID: {cr.id}, Name: {cr.name}, Freelancer: {cr.freelancer.email}")
        
    invoices = Invoice.objects.filter(client__email=email)
    print(f"Invoices: {invoices.count()}")
    for inv in invoices:
        print(f"  {inv.invoice_number}: {inv.status}, {inv.total}")

    contracts = Contract.objects.filter(client__email=email)
    print(f"Contracts: {contracts.count()}")
    for c in contracts:
        print(f"  {c.title}: {c.status}")

emails = ['client@test.com', 'googletest1774251518@one.com', 'amar@gmail.com']
for e in emails:
    debug_full(e)
