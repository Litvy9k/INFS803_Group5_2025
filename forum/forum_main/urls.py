from django.urls import path
from .views import (
    PostCreateView, 
    PostDeleteView, 
    PostEditView, 
    PostListView, 
    PostGetView, 
    PostUpvoteView, 
    ReplyCreateView,
    ReplyListByPostView,
    ReplyDeleteView,
    ReplyEditView,
    ReplyUpvoteView,
    SortedPostListView,
    PostSearchView,
    CurrentUserPostView,
    PostByUserView
)

urlpatterns = [
    path('post/create/', PostCreateView.as_view(), name='post-create'),
    path('post/delete/<int:pk>/', PostDeleteView.as_view(), name='post-delete'),
    path('post/edit/<int:pk>/', PostEditView.as_view(), name='post-edit'),
    path('post/', PostListView.as_view(), name='post-list'),
    path('post/<int:pk>/', PostGetView.as_view(), name='post-get'),
    path('post/upvote/<int:pk>/', PostUpvoteView.as_view(), name='post-upvote'),
    path('post/<int:post_pk>/reply/create/', ReplyCreateView.as_view(), name='reply-create'),
    path('post/<int:post_pk>/reply/create/<int:parent_pk>/', ReplyCreateView.as_view(), name='reply-to-reply'),
    path('post/<int:post_pk>/reply/', ReplyListByPostView.as_view(), name='reply-list-by-post'),
    path('post/reply/delete/<int:pk>/', ReplyDeleteView.as_view(), name='reply-delete'),
    path('post/reply/edit/<int:pk>/', ReplyEditView.as_view(), name='reply-edit'),
    path('post/reply/upvote/<int:pk>/', ReplyUpvoteView.as_view(), name='reply-upvote'),
    path('post/sorted/', SortedPostListView.as_view(), name='post-list-sorted'),
    path('post/search/', PostSearchView.as_view(), name='post-search'),
    path('post/user/current/', CurrentUserPostView.as_view(), name='get-current-user-post'),
    path('post/user/<int:user_id>/', PostByUserView.as_view(), name='get-user-post')
]