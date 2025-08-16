from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # This allows any user (even unauthenticated ones) to access this view
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
