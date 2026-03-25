import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

user = User.objects.filter(username='neel').first()
if user:
    user.role = User.Role.FREELANCER
    user.save()
    print(f"Updated user {user.username} role to {user.role}")
else:
    print("User neel not found")
