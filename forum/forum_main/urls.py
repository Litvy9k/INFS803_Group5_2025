from django.urls import path
from .views import PostCreateView

urlpatterns = [
    path('post/create/', PostCreateView.as_view(), name='post-create'),
]