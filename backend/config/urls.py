from django.contrib import admin
from django.urls import path, include
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from django.views.generic import RedirectView
from django.conf import settings

@require_GET
def csrf_view(request):
    return JsonResponse({'csrfToken': get_token(request)})

from apps.users.views import FirebaseLoginView, UserProfileView, CustomPasswordResetView

urlpatterns = [
    path('api/csrf/', csrf_view),
    path('admin/', admin.site.urls),
    # Redirect backend password reset link to frontend
    path('password-reset-confirm/<uidb64>/<token>/', 
         RedirectView.as_view(url=settings.FRONTEND_URL + '/auth/reset-password-confirm/%(uidb64)s/%(token)s/'), 
         name='password_reset_confirm'),
    path('api/auth/password/reset/', CustomPasswordResetView.as_view(), name='rest_password_reset'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/', include('apps.users.urls')),
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
