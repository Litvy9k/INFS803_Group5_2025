from django.urls import path
from .views import PostCreateView, PostDeleteView

urlpatterns = [
    path('post/create/', PostCreateView.as_view(), name='post-create'),
    path('post/delete/<int:pk>', PostDeleteView.as_view(), name='post-delete')
]