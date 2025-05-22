from django.urls import path
from .views import PostCreateView, PostDeleteView, PostEditView

urlpatterns = [
    path('post/create/', PostCreateView.as_view(), name='post-create'),
    path('post/delete/<int:pk>/', PostDeleteView.as_view(), name='post-delete'),
    path('post/edit/<int:pk>/', PostEditView.as_view(), name='post-edit')
]