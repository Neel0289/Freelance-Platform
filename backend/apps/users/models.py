from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        FREELANCER = 'FREELANCER', 'Freelancer'
        CLIENT = 'CLIENT', 'Client'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.FREELANCER)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    timezone = models.CharField(max_length=50, default='UTC')

    def __str__(self):
        return f"{self.email} ({self.role})"
