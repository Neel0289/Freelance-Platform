from django.contrib import admin
from .models import Project, TimeEntry


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'freelancer', 'status', 'budget', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['description', 'project', 'hours', 'date', 'billable']
    list_filter = ['billable', 'date']
