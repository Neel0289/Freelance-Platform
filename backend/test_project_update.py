import os
import django
from decimal import Decimal
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.projects.models import Project

try:
    project = Project.objects.get(id=1)
    print(f"Updating project: {project.title}")
    project.status = 'COMPLETED'
    project.budget = Decimal('1000.00')
    project.save()
    print("Project updated successfully!")
except Exception as e:
    print(f"FAILED to update project: {e}")
    import traceback
    traceback.print_exc()
