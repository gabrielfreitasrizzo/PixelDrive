import uuid
from django.db import models
from django.contrib.auth.models import User

class Arquivo(models.Model):

    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='arquivos'
    )

    nome = models.CharField(max_length=255)
    chave = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, help_text="Identificador único seguro para o arquivo")
    mime_type = models.CharField(max_length=100, help_text="Tipo do arquivo (png, jpg, pdf ou txt)")
    tamanho = models.BigIntegerField(help_text="Tamanho do arquivo em bytes")
    data_upload = models.DateTimeField(auto_now_add=True)
    arquivo = models.FileField(upload_to='uploads/')

    def __str__(self):
        return f"{self.nome} ({self.usuario.username})"
    
    class Meta:
        verbose_name = "Arquivo"
        verbose_name_plural = "Arquivos"
        ordering = ['-data_upload']