import os
import django
from decimal import Decimal
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.projects.serializers import ProjectSerializer
from apps.projects.models import Project

try:
    project = Project.objects.get(id=1)
    # Simulate FIXED frontend data
    data = {
        'client': project.client.id,
        'title': 'Test Project',
        'status': 'COMPLETED',
        'budget': '1000.00',
        'start_date': None, # FIXED: null instead of ''
        'due_date': None,   # FIXED: null instead of ''
        'currency': 'INR'
    }
    serializer = ProjectSerializer(instance=project, data=data, partial=True)
    if serializer.is_valid():
        print("SUCCESS! Serializer is valid with null dates.")
        serializer.save()
        print("Project updated successfully!")
    else:
        print(f"FAILED! Serializer ERRORS: {serializer.errors}")
except Exception as e:
    print(f"FAILED: {e}")
