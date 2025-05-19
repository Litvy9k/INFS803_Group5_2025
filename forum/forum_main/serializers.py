from rest_framework import serializers
from .models import ForumPost

class PostSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    created_at = serializers.DateTimeField(read_only=True)
    upvotes = serializers.IntegerField(read_only=True)

    class Meta:
        model = ForumPost
        fields = ('id', 'title', 'content', 'author', 'created_at', 'upvotes')