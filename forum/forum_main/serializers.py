from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ForumPost, Reply
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email')

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    created_at = serializers.DateTimeField(read_only=True)
    upvotes = serializers.IntegerField(source='upvotes_count', read_only=True)

    class Meta:
        model = ForumPost
        fields = ('id', 'title', 'content', 'author', 'created_at', 'upvotes')

class ReplySerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    upvotes = serializers.IntegerField(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Reply.objects.all(),
        required=False, allow_null=True
    )
    parent_author  = serializers.SerializerMethodField()
    parent_content = serializers.SerializerMethodField()

    class Meta:
        model  = Reply
        fields = (
            'id', 'author', 'content', 'created_at',
            'upvotes', 'parent', 'parent_author', 'parent_content'
        )
        read_only_fields = ('author','created_at','upvotes',
                            'parent_author','parent_content')

    def get_parent_author(self, obj):
        if obj.parent:
            return obj.parent.author.username
        return None

    def get_parent_content(self, obj):
        if obj.parent:
            return obj.parent.content
        return None

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
