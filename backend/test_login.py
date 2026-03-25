import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from django.contrib.auth import authenticate

def test_login_methods():
    # Find a user
    user = User.objects.filter(email='client@test.com').first()
    if not user:
        print("User client@test.com not found. Creating one...")
        user = User.objects.create_user(
            username='client_test',
            email='client@test.com',
            password='testpassword123',
            role='CLIENT'
        )
    else:
        user.set_password('testpassword123')
        user.save()
        print(f"User found: {user.username} / {user.email}")

    # Test Email Login
    print("\nAttempting login with EMAIL...")
    u_email = authenticate(username='client@test.com', password='testpassword123')
    print(f"Result (Email): {'SUCCESS' if u_email else 'FAILED'}")

    # Test Username Login
    print("\nAttempting login with USERNAME...")
    u_user = authenticate(username=user.username, password='testpassword123')
    print(f"Result (Username): {'SUCCESS' if u_user else 'FAILED'}")

if __name__ == "__main__":
    test_login_methods()
