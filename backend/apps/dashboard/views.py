from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.clients.models import Client
from apps.projects.models import Project
from apps.invoices.models import Invoice


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = timezone.now().date()

    # Counts
    total_clients = Client.objects.filter(
        freelancer=user, deleted_at__isnull=True
    ).count()
    active_projects = Project.objects.filter(
        freelancer=user, status='ACTIVE', deleted_at__isnull=True
    ).count()

    invoices = Invoice.objects.filter(freelancer=user)
    total_revenue = invoices.filter(status='PAID').aggregate(
        total=Sum('total')
    )['total'] or 0
    pending_invoices = invoices.filter(
        status__in=['SENT', 'OVERDUE']
    ).count()
    overdue_invoices = invoices.filter(status='OVERDUE').count()
    pending_amount = invoices.filter(
        status__in=['SENT', 'OVERDUE']
    ).aggregate(total=Sum('total'))['total'] or 0

    # Monthly revenue for chart (last 12 months)
    monthly_revenue = []
    for i in range(11, -1, -1):
        month_start = today.replace(day=1)
        for _ in range(i):
            month_start = (month_start - timezone.timedelta(days=1)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1)

        revenue = invoices.filter(
            status='PAID',
            paid_at__date__gte=month_start,
            paid_at__date__lt=month_end,
        ).aggregate(total=Sum('total'))['total'] or 0

        monthly_revenue.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': float(revenue),
        })

    # Recent invoices
    recent_invoices = invoices.select_related('client').order_by('-created_at')[:5]
    recent_invoices_data = [
        {
            'id': inv.id,
            'invoice_number': inv.invoice_number,
            'client_name': inv.client.name,
            'total': float(inv.total),
            'status': inv.status,
            'due_date': inv.due_date,
        }
        for inv in recent_invoices
    ]

    return Response({
        'total_clients': total_clients,
        'active_projects': active_projects,
        'total_revenue': float(total_revenue),
        'pending_invoices': pending_invoices,
        'overdue_invoices': overdue_invoices,
        'pending_amount': float(pending_amount),
        'monthly_revenue': monthly_revenue,
        'recent_invoices': recent_invoices_data,
    })
