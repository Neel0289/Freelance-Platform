import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.clients.models import Client
from apps.projects.models import Project
from apps.invoices.serializers import InvoiceSerializer

freelancer = User.objects.filter(role='FREELANCER').first()
client = Client.objects.filter(freelancer=freelancer).first()
project = Project.objects.filter(freelancer=freelancer, client=client).first()

data = {
    'client': client.id,
    'project': project.id if project else None,
    'issue_date': '2026-03-24',
    'due_date': '2026-04-08',
    'tax_rate': 0,
    'notes': 'Project will be started after 50% advance payment.',
    'terms': 'Nothing',
    'items': [
        {
            'description': 'Project Work',
            'quantity': 1,
            'unit_price': 1500
        }
    ]
}

serializer = InvoiceSerializer(data=data)
if serializer.is_valid():
    try:
        # We need to simulate the view's perform_create which passes freelancer
        invoice = serializer.save(freelancer=freelancer)
        print("Success! Invoice ID:", invoice.id)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("Validation Error:", serializer.errors)
