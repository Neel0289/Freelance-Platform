import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User

print("Last logins:")
for u in User.objects.all().order_by('-last_login'):
    print(f" - {u.email} ({u.role}): {u.last_login}")
