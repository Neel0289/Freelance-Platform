import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.clients.models import Client
from apps.invoices.models import Invoice
from apps.contracts.models import Contract

print(f"Total Clients: {Client.objects.count()}")
for c in Client.objects.all():
    print(f" - ID: {c.id}, Email: {c.email}, Name: {c.name}")

print(f"\nTotal Invoices: {Invoice.objects.count()}")
for inv in Invoice.objects.all():
    print(f" - ID: {inv.id}, Client Email: {inv.client.email}, Status: {inv.status}")

print(f"\nTotal Contracts: {Contract.objects.count()}")
for con in Contract.objects.all():
    print(f" - ID: {con.id}, Client Email: {con.client.email}, Status: {con.status}")
