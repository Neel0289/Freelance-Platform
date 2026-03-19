from django.contrib import admin
from .models import Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'freelancer', 'status', 'total', 'due_date']
    list_filter = ['status', 'created_at']
    search_fields = ['invoice_number', 'client__name']
    inlines = [InvoiceItemInline]
