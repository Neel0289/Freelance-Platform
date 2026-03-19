import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_email():
    try:
        print(f"Using backend: {settings.EMAIL_BACKEND}")
        print(f"Sending test email to {settings.EMAIL_HOST_USER}...")
        
        send_mail(
            'Test Email from Freelancer CRM',
            'If you are reading this, your email configuration is working!',
            settings.DEFAULT_FROM_EMAIL,
            [settings.EMAIL_HOST_USER], # Sending to yourself for testing
            fail_silently=False,
        )
        print("Success! Check your inbox (or console if using console backend).")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == "__main__":
    test_email()
