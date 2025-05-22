from django.urls import path
from .views import PostCreateView, PostDeleteView, PostEditView, PostListView, PostGetView, PostUpvoteView

urlpatterns = [
    path('post/create/', PostCreateView.as_view(), name='post-create'),
    path('post/delete/<int:pk>/', PostDeleteView.as_view(), name='post-delete'),
    path('post/edit/<int:pk>/', PostEditView.as_view(), name='post-edit'),
    path('post/', PostListView.as_view(), name='post-list'),
    path('post/<int:pk>/', PostGetView.as_view(), name='post-get'),
    path('post/upvote/<int:pk>/', PostUpvoteView.as_view(), name='post-upvote')
]