import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.users.models import User
from apps.dashboard.views import dashboard_stats
from rest_framework.test import APIRequestFactory, force_authenticate

try:
    user = User.objects.filter(email='neel9086@gmail.com').first()
    factory = APIRequestFactory()
    request = factory.get('/api/dashboard/stats/')
    force_authenticate(request, user=user)
    response = dashboard_stats(request)
    print(f"Status Code: {response.status_code}")
    print(f"Data: {response.data}")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
