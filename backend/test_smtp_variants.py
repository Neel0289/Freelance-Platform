import os
import django
from django.core.mail import send_mail
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_smtp(user, password):
    print(f"Testing with User: {user}")
    try:
        from django.core.mail.backends.smtp import EmailBackend
        backend = EmailBackend(
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=user,
            password=password,
            use_tls=settings.EMAIL_USE_TLS,
            fail_silently=False,
        )
        send_mail(
            'Test Email',
            'Body',
            settings.DEFAULT_FROM_EMAIL,
            ['neel9086@gmail.com'],
            connection=backend,
        )
        print("SUCCESS")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

# Try current (from settings after my change)
print("--- Attempt 1 (Current) ---")
test_smtp(os.getenv('EMAIL_HOST_USER'), os.getenv('EMAIL_HOST_PASSWORD'))

# Try with register email
print("\n--- Attempt 2 (Register Email) ---")
test_smtp('hetmungara107@gmail.com', os.getenv('EMAIL_HOST_PASSWORD'))
