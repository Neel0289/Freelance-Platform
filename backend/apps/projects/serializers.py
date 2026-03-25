from rest_framework import serializers
from .models import Project, TimeEntry, WorkRequest, WorkRequestAttachment


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = ['id', 'project', 'description', 'hours', 'date', 'billable']
        read_only_fields = ['id', 'project']


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    total_hours = serializers.SerializerMethodField()
    contract_status = serializers.SerializerMethodField()
    invoice_status = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'client', 'client_name', 'title', 'description',
                  'status', 'start_date', 'due_date', 'budget', 'currency',
                  'created_at', 'total_hours', 'contract_status', 'invoice_status']
        read_only_fields = ['id', 'created_at']

    def get_total_hours(self, obj):
        return sum(te.hours for te in obj.time_entries.all())

    def get_contract_status(self, obj):
        contract = obj.contracts.filter(status__in=['SENT', 'SIGNED']).order_by('-created_at').first()
        return contract.status if contract else None

    def get_invoice_status(self, obj):
        invoice = obj.invoices.filter(status__in=['SENT', 'PAID', 'OVERDUE']).order_by('-created_at').first()
        return invoice.status if invoice else None


class WorkRequestAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkRequestAttachment
        fields = ['id', 'file', 'filename', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkRequestSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    freelancer_name = serializers.SerializerMethodField()
    attachments = WorkRequestAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = WorkRequest
        fields = [
            'id', 'client', 'client_name', 'freelancer', 'freelancer_name',
            'title', 'description', 'deadline', 'budget', 'status', 'created_at', 'attachments'
        ]
        read_only_fields = ['id', 'client', 'created_at', 'status']

    def get_client_name(self, obj):
        return obj.client.get_full_name() or obj.client.username

    def get_freelancer_name(self, obj):
        return obj.freelancer.get_full_name() or obj.freelancer.username

    def create(self, validated_data):
        # Automatically set the client to the current user
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)
