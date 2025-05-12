from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import User

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Minimal 6 digits for password
    password = serializers.CharField(write_only=True, required=True, allow_blank=False)

    class Meta:
        model  = User
        fields = [
            'username', 'password', 'nickname',
            'avatar', 'email', 'first_name', 'last_name', 
            'date_joined', 'last_login', 'is_moderator',
        ]
        # Required: Username, Password, Nickname
        # Optional: Email, Avatar, First name, Last name
        extra_kwargs = {
            'username':   {'required': True,  'allow_blank': False, 'min_length': 4, 'max_length': 20},
            'password':   {'write_only': True, 'min_length': 6, 'max_length': 20},
            'nickname':   {'required': True,  'allow_blank': False, 'min_length': 1, 'max_length': 30},
            'avatar':     {'required': False, 'allow_null': True},
            'email':      {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name':  {'required': False, 'allow_blank': True},
            'date_joined': {'read_only': True},
            'last_login':     {'read_only': True},
            'is_moderator':  {'read_only': True},
        }

    def validate_username(self, value):
        if not value.isalnum():
            raise serializers.ValidationError("Username can only contail latin characters and numbers")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate(self, attrs):
        if not attrs.get('nickname'):
            raise serializers.ValidationError({'nickname': "Nickname cannot be blank"})
        return attrs

    def create(self, validated_data):   
        pwd = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(pwd)
        user.save()
        return user