from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']
        read_only_fields = ['id', 'total']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True, default=None)

    class Meta:
        model = Invoice
        fields = ['id', 'client', 'client_name', 'project', 'project_title',
                  'invoice_number', 'status', 'issue_date', 'due_date',
                  'subtotal', 'tax_rate', 'tax_amount', 'total',
                  'notes', 'terms', 'razorpay_order_id', 'razorpay_payment_id',
                  'paid_at', 'created_at', 'items']
        read_only_fields = ['id', 'invoice_number', 'subtotal', 'tax_amount',
                            'total', 'created_at', 'razorpay_order_id',
                            'razorpay_payment_id', 'paid_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.calculate_totals()
        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)

        instance.calculate_totals()
        instance.save()
        return instance
