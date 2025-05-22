from rest_framework import generics, permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ForumPost
from .serializers import PostSerializer
from .permissions import IsAuthorOrMod
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts    import get_object_or_404

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

class PostListView(generics.ListAPIView):
    queryset = ForumPost.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]

    
class PostGetView(generics.RetrieveAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]

class PostUpvoteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        post = get_object_or_404(ForumPost, pk=pk)
        user = request.user

        if post.upvoted_by.filter(pk=user.pk).exists():
            post.upvoted_by.remove(user)
            upvoted = False
        else:
            post.upvoted_by.add(user)
            upvoted = True

        return Response({
            'upvotes': post.upvotes,
            'upvoted': upvoted
        }, status=status.HTTP_200_OK)