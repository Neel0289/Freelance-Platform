import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate, APIRequestFactory
from apps.users.models import User
from apps.clients.models import Client
from apps.projects.models import Project
from apps.invoices.views import InvoiceViewSet

# Setup
factory = APIRequestFactory()
freelancer = User.objects.filter(role='FREELANCER').first()
client = Client.objects.filter(freelancer=freelancer).first()
project = Project.objects.filter(freelancer=freelancer, client=client).first()

data = {
    'client': client.id if client else None,
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

print("Testing Payload:", json.dumps(data, indent=2))

view = InvoiceViewSet.as_view({'post': 'create'})
request = factory.post('/api/invoices/', data, format='json')
force_authenticate(request, user=freelancer)

response = view(request)
print(f"Status Code: {response.status_code}")
if response.status_code != 201:
    print("Error Details:", json.dumps(response.data, indent=2))
else:
    print("Success! Created Invoice ID:", response.data.get('id'))
