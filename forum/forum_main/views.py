from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ForumPost
from .serializers import PostSerializer

class PostCreateView(generics.CreateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]