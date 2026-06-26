from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Arquivo

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class ArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arquivo
        fields = ['id', 'usuario', 'nome', 'chave', 'mime_type', 
                  'tamanho', 'data_upload', 'arquivo']
        read_only_fields = ('usuario', 'chave', 'data_upload', 'nome', 'mime_type', 'tamanho')