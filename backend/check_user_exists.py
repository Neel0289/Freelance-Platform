import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
email = 'neel9086@gmail.com'
user = User.objects.filter(email=email).first()
if user:
    print(f"User found: {user.email}, ID: {user.id}")
else:
    print(f"User NOT found: {email}")
