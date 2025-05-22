from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ForumPost
from .serializers import PostSerializer

class PostCreateView(generics.CreateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class PostDeleteView(generics.RetrieveDestroyAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]

    def get_permissions(self):
        perms = super().get_permissions()
        if self.request.method == 'DELETE':
            perms.append(permissions.IsAdminUser() if not self.request.user.is_staff else permissions.AllowAny())
        return perms