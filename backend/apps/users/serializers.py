from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User, PortfolioItem


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = ['id', 'title', 'description', 'image', 'url', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    portfolio_items = PortfolioItemSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'role', 
            'avatar', 'phone', 'timezone', 'title', 'bio', 'skills', 
            'availability', 'rating', 'completed_jobs', 'portfolio_items'
        ]
        read_only_fields = ['id', 'email', 'rating', 'completed_jobs']


class CustomRegisterSerializer(RegisterSerializer):
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.FREELANCER)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    timezone = serializers.CharField(required=False, default='UTC')

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['role'] = self.validated_data.get('role', User.Role.FREELANCER)
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['phone'] = self.validated_data.get('phone', '')
        data['timezone'] = self.validated_data.get('timezone', 'UTC')
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get('role', User.Role.FREELANCER)
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.phone = self.cleaned_data.get('phone', '')
        user.timezone = self.cleaned_data.get('timezone', 'UTC')
        user.save()
        return user
