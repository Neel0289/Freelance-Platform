import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

users = User.objects.filter(username__icontains='neel')
if not users:
    users = User.objects.filter(first_name__icontains='neel')
if not users:
    users = User.objects.filter(last_name__icontains='neel')

print(f"Found {len(users)} users matching 'neel'")
for user in users:
    print(f"ID: {user.id}, Username: {user.username}, Name: {user.get_full_name()}, Role: {user.role}, Availability: {user.availability}")
