import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

def check_users():
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    for user in users:
        print(f"User: {user.username}, Email: {user.email}, Is Active: {user.is_active}")

if __name__ == "__main__":
    check_users()
