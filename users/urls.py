from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # This URL is for your custom registration view
    path('register/', RegisterView.as_view(), name='auth_register'),
    # These URLs are for Simple JWT's built-in login and token refresh views
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]