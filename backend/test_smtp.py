import os
import django
from django.core.mail import send_mail
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def mask(s):
    if len(s) < 4: return "***"
    return s[:2] + "***" + s[-2:]

print(f"EMAIL_HOST_USER: {mask(os.getenv('EMAIL_HOST_USER', ''))}")
print(f"EMAIL_HOST_PASSWORD: {mask(os.getenv('EMAIL_HOST_PASSWORD', ''))}")

try:
    print(f"Attempting to send test email from {settings.DEFAULT_FROM_EMAIL}...")
    send_mail(
        'Test Email',
        'Body',
        settings.DEFAULT_FROM_EMAIL,
        ['neel9086@gmail.com'],
        fail_silently=False,
    )
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
