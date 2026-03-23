from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        """
        Disable CSRF check for API requests.
        CORS already provides protection by restricting allowed origins.
        """
        return 
