from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Minimal 6 digits for password
    password = serializers.CharField(write_only=True, min_length=6, required=True, allow_blank=False)

    class Meta:
        model  = User
        fields = [
            'username', 'password', 'nickname',
            'avatar', 'email', 'first_name', 'last_name',
        ]
        # Required: Username, Password, Nickname
        # Optional: Email, Avatar, First name, Last name
        extra_kwargs = {
            'username':   {'required': True,  'allow_blank': False},
            'nickname':   {'required': True,  'allow_blank': False},
            'avatar':     {'required': False, 'allow_null': True},
            'email':      {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name':  {'required': False, 'allow_blank': True},
        }

    # def validate_smth(self, attrs):
    # Some more validations here, e.g. No blank in username

    def create(self, validated_data):   
        pwd = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(pwd)
        user.save()
        return user