import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

print(f"Total Users: {User.objects.count()}")
print(f"Freelancers: {User.objects.filter(role=User.Role.FREELANCER).count()}")
print(f"Clients: {User.objects.filter(role=User.Role.CLIENT).count()}")

for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}, Email: {user.email}")
