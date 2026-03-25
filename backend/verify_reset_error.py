import os
import django
from django.test import Client
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

client = Client()
email = 'neel9086@gmail.com'

print(f"Sending password reset request for {email}...")
response = client.post('/api/auth/password/reset/', {'email': email}, content_type='application/json')

print(f"Status Code: {response.status_code}")
try:
    data = response.json()
    print(f"Response Body: {json.dumps(data, indent=2)}")
except:
    print(f"Response Content: {response.content}")

if response.status_code == 400 and 'Email sending failed' in str(response.content):
    print("\nSUCCESS! Diagnostic error was returned correctly.")
elif response.status_code == 200:
    print("\nSUCCESS! Email was sent (Real SMTP worked!)")
else:
    print("\nFAILURE! Unexpected response.")
