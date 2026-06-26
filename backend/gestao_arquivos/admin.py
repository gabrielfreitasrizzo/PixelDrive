from django.contrib import admin
from .models import Arquivo

@admin.register(Arquivo)
class ArquivoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'usuario', 'mime_type', 'tamanho', 'data_upload')
    search_fields = ('nome', 'usuario__username', 'mime_type')
    list_filter = ('mime_type', 'data_upload', 'usuario')
    readonly_fields = ('chave', 'data_upload')
