import mimetypes
from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from django.contrib.auth.models import User
from .models import Arquivo
from .serializers import RegistroSerializer, ArquivoSerializer

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistroSerializer

class ArquivoViewSet(viewsets.ModelViewSet):
    serializer_class = ArquivoSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        return Arquivo.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        arquivo_fisico = self.request.FILES.get('arquivo')

        nome = arquivo_fisico.name
        tamanho = arquivo_fisico.size
        mime_type, _ = mimetypes.guess_type(nome)

        serializer.save(
            usuario=self.request.user,
            nome=nome,
            tamanho=tamanho,
            mime_type=mime_type if mime_type else 'application/octet-stream'
        )