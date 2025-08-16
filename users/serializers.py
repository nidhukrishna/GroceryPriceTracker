from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    # password confirmation field
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2')
        # ensures the password isn't sent back in response
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password didn't match."})
        return attrs

    def create(self, validated_data):
        # creating the new user after validation
        user = User.objects.create(
            username=validated_data['username']
        )
        # set_password() to ensure the password is properly hashed
        user.set_password(validated_data['password'])
        user.save()
        return user