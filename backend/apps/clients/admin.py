from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'freelancer', 'created_at']
    list_filter = ['currency', 'created_at']
    search_fields = ['name', 'email', 'company']
