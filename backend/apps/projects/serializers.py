from rest_framework import serializers
from .models import Project, TimeEntry


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = ['id', 'project', 'description', 'hours', 'date', 'billable']
        read_only_fields = ['id', 'project']


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    total_hours = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'client', 'client_name', 'title', 'description',
                  'status', 'start_date', 'due_date', 'budget', 'currency',
                  'created_at', 'total_hours']
        read_only_fields = ['id', 'created_at']

    def get_total_hours(self, obj):
        return sum(te.hours for te in obj.time_entries.all())
