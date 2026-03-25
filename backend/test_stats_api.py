import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.dashboard.views import dashboard_stats
from rest_framework.test import APIRequestFactory, force_authenticate

def test_stats_api(email):
    print(f"Testing stats API for {email}...")
    user = User.objects.get(email=email)
    factory = APIRequestFactory()
    request = factory.get('/api/dashboard/stats/')
    force_authenticate(request, user=user)
    
    response = dashboard_stats(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")

if __name__ == "__main__":
    test_stats_api('client@test.com')
