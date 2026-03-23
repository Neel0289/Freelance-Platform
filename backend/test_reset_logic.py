import os
import django
from django.conf import settings
from django.test import RequestFactory

# Setup Django environment FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# NOW import DRF/Serializers
from dj_rest_auth.serializers import PasswordResetSerializer

def test_reset():
    try:
        email = 'neel9086@gmail.com'
        data = {'email': email}
        
        # Create a mock request
        factory = RequestFactory()
        request = factory.post('/api/auth/password/reset/', data)
        
        print(f"Testing password reset for {email}...")
        print(f"Using DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        print(f"Using EMAIL_HOST: {settings.EMAIL_HOST}")
        
        serializer = PasswordResetSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            print("Serializer is valid. Saving...")
            serializer.save()
            print("Success! Password reset logic completed.")
        else:
            print(f"Serializer errors: {serializer.errors}")
            
    except Exception as e:
        print("\n--- ERROR CAUGHT ---")
        import traceback
        traceback.print_exc()
        print("--------------------\n")

if __name__ == "__main__":
    test_reset()
