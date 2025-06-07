from rest_framework import serializers
from .models import Report
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'description', 'type', 'steps', 'user', 'status', 'priority', 'created_at', 'updated_at']
        read_only_fields = ['user', 'status', 'created_at', 'updated_at'] 