from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ForumPost
from .serializers import PostSerializer
from .permissions import IsAuthorOrMod

class PostCreateView(generics.CreateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class PostDeleteView(generics.RetrieveDestroyAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthorOrMod]

class PostEditView(generics.RetrieveUpdateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthorOrMod]
