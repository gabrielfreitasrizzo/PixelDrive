import os
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Arquivo

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user
    
class ArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arquivo
        fields = ['id', 'usuario', 'nome', 'chave', 'mime_type', 
                  'tamanho', 'data_upload', 'arquivo']
        read_only_fields = ('usuario', 'chave', 'data_upload', 'nome', 'mime_type', 'tamanho')

    def validate_arquivo(self, value):
        limite_bytes = 10 * 1024 * 1024  # 10 MB
        if value.size > limite_bytes:
            raise serializers.ValidationError("O arquivo é muito grande. O limite máximo é 10MB.")
        
        extensoes_validas = ['.png', '.jpg', '.pdf', '.txt']
        extensao_arquivo = os.path.splitext(value.name)[1].lower()

        if extensao_arquivo not in extensoes_validas:
            raise serializers.ValidationError(
                f"Formato inválido. Tipos permitidos: {', '.join(extensoes_validas)}"
            )
        
        return value