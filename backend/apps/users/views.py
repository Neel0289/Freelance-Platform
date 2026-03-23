from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login
from .serializers import UserSerializer
from .firebase_utils import verify_firebase_token, get_or_create_firebase_user


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
        login(request, user)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
