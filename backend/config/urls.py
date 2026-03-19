from django.contrib import admin
from django.urls import path, include
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.http import require_GET

@require_GET
def csrf_view(request):
    return JsonResponse({'csrfToken': get_token(request)})

urlpatterns = [
    path('api/csrf/', csrf_view),
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/google/', include('apps.users.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/invoices/', include('apps.invoices.urls')),
    path('api/contracts/', include('apps.contracts.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/webhooks/', include('apps.invoices.webhook_urls')),
    path('accounts/', include('allauth.urls')),
]
