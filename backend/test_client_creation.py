import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.clients.models import Client

try:
    user = User.objects.filter(email='neel9086@gmail.com').first()
    if not user:
        print("User not found")
    else:
        print(f"Creating client for user: {user.email}")
        client = Client.objects.create(
            freelancer=user,
            name='Test Client',
            email='test@example.com'
        )
        print(f"Client created successfully! ID: {client.id}")
except Exception as e:
    print(f"FAILED to create client: {e}")
    import traceback
    traceback.print_exc()
