import os
import django
from django.utils import timezone
import uuid
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.contracts.models import Contract
from apps.clients.models import Client
from apps.users.models import User
from apps.contracts.views import sign_contract
from rest_framework.test import APIRequestFactory

try:
    user = User.objects.filter(email='neel9086@gmail.com').first()
    if not user:
         user = User.objects.first()
    client = Client.objects.first()
    
    if not user or not client:
        print(f"User found: {user}, Client found: {client}")
        print("Missing user or client to run test.")
    else:
        # Create a test contract
        contract = Contract.objects.create(
            freelancer=user,
            client=client,
            title="Verification Contract",
            content="This is a test contract content for verification.",
            status='DRAFT'
        )
        print(f"Contract created: {contract.id}, Token: {contract.signature_token}")
        
        # Verify GET (View)
        factory = APIRequestFactory()
        token = str(contract.signature_token)
        request = factory.get(f'/api/contracts/sign/{token}/')
        response = sign_contract(request, token=token)
        print(f"GET status: {response.status_code}")
        if response.status_code == 200:
            print(f"Contract Content: {response.data['content']}")
        else:
            print(f"GET failed: {response.data}")
            
        # Verify POST (Sign)
        request = factory.post(f'/api/contracts/sign/{token}/', {'agreed': True})
        response = sign_contract(request, token=token)
        print(f"POST status: {response.status_code}")
        if response.status_code == 200:
            contract.refresh_from_db()
            print(f"Contract Status after signing: {contract.status}, Signed At: {contract.signed_at}")
        else:
            print(f"POST failed: {response.data}")

        # Cleanup
        contract.delete()
        print("Verification complete and cleanup done.")

except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
