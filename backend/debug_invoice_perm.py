import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.invoices.models import Invoice
from apps.users.permissions import IsParticipant
from rest_framework.test import APIRequestFactory

# Need to check the real invoice #4
try:
    invoice = Invoice.objects.get(id=4)
    print(f"Found Invoice {invoice.id}!")
    print(f"  Freelancer: {invoice.freelancer.email}")
    print(f"  Client email on invoice: {invoice.client.email}")
except Invoice.DoesNotExist:
    print("Invoice 4 does not exist in the database.")
    exit(0)

# Simulate request with client user
try:
    client_user = User.objects.get(email='clasherscode6@gmail.com')
    print(f"Found Client User: {client_user.email}")
except User.DoesNotExist:
    print("Client user not found.")
    exit(0)

factory = APIRequestFactory()
request = factory.get(f'/api/invoices/{invoice.id}/')
request.user = client_user

# Check get_queryset logic
from apps.invoices.views import InvoiceViewSet
view = InvoiceViewSet()
view.request = request
qs = view.get_queryset()
print(f"Queryset output count for client: {qs.count()}")
if qs.filter(id=invoice.id).exists():
    print("Invoice IS in the queryset!")
else:
    print("Invoice IS NOT in the queryset!")

# Check IsParticipant permission logic
perm = IsParticipant()
has_perm = perm.has_object_permission(request, view, invoice)
print(f"IsParticipant gives permission: {has_perm}")
