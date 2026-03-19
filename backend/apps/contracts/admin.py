from django.contrib import admin
from .models import Contract


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'freelancer', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title']
