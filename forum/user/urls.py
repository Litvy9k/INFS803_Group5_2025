from django.urls import path
from .views import RegisterView, LogoutView, UserUpdateView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    #Ive removed these for now so that it works with Azure SQL Database - Tyler
    # path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='token_logout'),
    path('update/', UserUpdateView.as_view(), name='user-update'),
]