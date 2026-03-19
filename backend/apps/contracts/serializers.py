from rest_framework import serializers
from .models import Contract


class ContractSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)

    class Meta:
        model = Contract
        fields = ['id', 'client', 'client_name', 'project', 'project_title',
                  'title', 'content', 'status', 'signed_at', 'signature_token',
                  'created_at']
        read_only_fields = ['id', 'signature_token', 'signed_at', 'created_at']
