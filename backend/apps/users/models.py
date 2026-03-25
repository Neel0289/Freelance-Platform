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
    
    # Freelancer Profile Fields
    title = models.CharField(max_length=255, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    availability = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    completed_jobs = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.email} ({self.role})"


class PortfolioItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='portfolio/', null=True, blank=True)
    url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
