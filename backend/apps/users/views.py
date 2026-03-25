from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login
from django.db import models
from .models import User
from .serializers import UserSerializer, CustomRegisterSerializer
from .firebase_utils import verify_firebase_token, get_or_create_firebase_user

# Add this import
from dj_rest_auth.views import PasswordResetView
from smtplib import SMTPException


class CustomPasswordResetView(PasswordResetView):
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except SMTPException as e:
            return Response(
                {'detail': f'Email sending failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'An unexpected error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FirebaseLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')
        role = request.data.get('role', 'FREELANCER')
        
        if not id_token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_token = verify_firebase_token(id_token)
        except RuntimeError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

        user = get_or_create_firebase_user(decoded_token, role)
        if not user:
            return Response({'error': 'Could not authenticate user'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Log the user in (creates a session)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FreelancerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for public discovery of freelancers.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """
        Returns all users who are not clients as discoverable freelancers.
        """
        queryset = User.objects.exclude(role=User.Role.CLIENT)
        
        # Filters
        availability = self.request.query_params.get('availability')
        if availability:
            queryset = queryset.filter(availability=(availability.lower() == 'true'))
            
        skill = self.request.query_params.get('skill')
        if skill:
            # We use skills as a JSON list, so we might need IC contains or similar.
            # For JSONField in Postgres, we can do some complex queries, 
            # but for simplicity, let's use __icontains on the raw JSON.
            queryset = queryset.filter(skills__icontains=skill)
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(title__icontains=search) |
                models.Q(username__icontains=search)
            )
            
        return queryset
