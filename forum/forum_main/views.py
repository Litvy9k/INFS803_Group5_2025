from django.db.models import Count, Max
from rest_framework import generics, permissions, status, filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import ForumPost, Reply
from .serializers import PostSerializer, ReplySerializer
from .permissions import IsAuthorOrMod, IsAuthenticatedAndActive
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts    import get_object_or_404

class PostCreateView(generics.CreateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedAndActive]

class PostDeleteView(generics.RetrieveDestroyAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthorOrMod]

class PostEditView(generics.RetrieveUpdateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthorOrMod]

class PostListView(generics.ListAPIView):
    queryset = ForumPost.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]

    
class PostGetView(generics.RetrieveAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]

class PostUpvoteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedAndActive]
    
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
    
class ReplyCreateView(generics.CreateAPIView):
    serializer_class = ReplySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedAndActive]

    def perform_create(self, serializer):
        post = get_object_or_404(ForumPost, pk=self.kwargs['post_pk'])
        parent = None
        if 'parent_pk' in self.kwargs:
            parent = get_object_or_404(Reply, pk=self.kwargs['parent_pk'])
        serializer.save(
            author=self.request.user,
            post=post,
            parent=parent
        )

class ReplyListByPostView(generics.ListAPIView):
    serializer_class = ReplySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        post_id = self.kwargs['post_pk']
        return Reply.objects.filter(post_id=post_id).order_by('created_at')

class ReplyDeleteView(generics.RetrieveDestroyAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthorOrMod]

class ReplyEditView(generics.RetrieveUpdateAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthorOrMod]

class ReplyUpvoteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedAndActive]
    
    def post(self, request, pk):
        reply = get_object_or_404(Reply, pk=pk)
        user = request.user

        if reply.upvoted_by.filter(pk=user.pk).exists():
            reply.upvoted_by.remove(user)
            upvoted = False
        else:
            reply.upvoted_by.add(user)
            upvoted = True

        return Response({
            'upvotes': reply.upvotes,
            'upvoted': upvoted
        }, status=status.HTTP_200_OK)
    
class SortedPostListView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.AllowAny]
    serializer_class = PostSerializer

    queryset = ForumPost.objects.annotate(
        reply_count = Count('replies'),
        latest_reply_time = Max('replies__created_at'),
        upvotes_count = Count('upvoted_by')
    )

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['upvotes_count', 'latest_reply_time', 'reply_count']
    ordering = ['-upvotes_count']

class PostSearchView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer

    queryset = ForumPost.objects.annotate(
        reply_count=Count('replies')
    )

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']