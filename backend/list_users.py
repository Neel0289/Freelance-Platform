import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User

print("Listing all CLIENT users:")
for u in User.objects.filter(role='CLIENT'):
    print(f" - {u.email} (Username: {u.username})")

print("\nListing all Users:")
for u in User.objects.all():
    print(f" - {u.email} ({u.role})")
