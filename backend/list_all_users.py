import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

all_users = User.objects.all()
print(f"Total Users: {len(all_users)}")
for user in all_users:
    print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}, IsSuperuser: {user.is_superuser}")
