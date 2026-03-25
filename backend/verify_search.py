import os
import django
from django.db import models

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

def search_freelancers(search_term):
    queryset = User.objects.filter(role=User.Role.FREELANCER)
    if search_term:
        queryset = queryset.filter(
            models.Q(first_name__icontains=search_term) |
            models.Q(last_name__icontains=search_term) |
            models.Q(title__icontains=search_term) |
            models.Q(username__icontains=search_term)
        )
    return queryset

search_results = search_freelancers('neel')
print(f"Search Results for 'neel': {len(search_results)}")
for user in search_results:
    print(f"Username: {user.username}, Role: {user.role}")
