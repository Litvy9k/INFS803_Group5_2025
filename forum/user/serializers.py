from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Minimal 6 digits for password
    password = serializers.CharField(write_only=True, required=True, allow_blank=False, min_length=6, max_length=20)

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
        avatar = validated_data.pop('avatar', None)
        if avatar is None:
            user.avatar = 'avatar/default.png'
        else:
            user.avatar = avatar
        user.set_password(pwd)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    nickname = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'nickname', 'password', 'avatar')

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def validate_nickname(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(nickname__iexact=value).exists():
            raise serializers.ValidationError("Nickname already in use.")
        return value

    def update(self, instance, validated_data):
        pwd = validated_data.pop('password', None)
        if pwd:
            instance.set_password(pwd)
        avatar = validated_data.pop('avatar', None)
        if avatar is not None:
            instance.avatar = avatar                
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance