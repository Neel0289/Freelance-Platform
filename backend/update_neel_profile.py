import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

user = User.objects.filter(username='neel').first()
if user:
    user.first_name = 'Neel'
    user.last_name = 'Freelancer'
    user.title = 'Full Stack Developer'
    user.bio = 'Expert in React, Node.js and Django development.'
    user.skills = ['React', 'Node.js', 'Django', 'Python']
    user.save()
    print(f"Updated user {user.username} profile details")
else:
    print("User neel not found")
