import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from django.contrib.auth import authenticate

def test_login_methods():
    email = 'client@test.com'
    password = 'testpassword123'
    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.create_user(
            username='client_test',
            email=email,
            password=password,
            role='CLIENT'
        )
    else:
        user.set_password(password)
        user.save()

    with open('test_login_results.txt', 'w') as f:
        f.write(f"Testing User: {user.username} / {user.email}\n")
        
        # Test Email Login
        u_email = authenticate(username=email, password=password)
        f.write(f"Email Login: {'SUCCESS' if u_email else 'FAILED'}\n")

        # Test Username Login
        u_user = authenticate(username=user.username, password=password)
        f.write(f"Username Login: {'SUCCESS' if u_user else 'FAILED'}\n")

if __name__ == "__main__":
    test_login_methods()
