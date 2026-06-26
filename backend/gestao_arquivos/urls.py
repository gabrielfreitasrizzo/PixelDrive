from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistroUsuarioView, ArquivoViewSet

router = DefaultRouter()
router.register(r'arquivos', ArquivoViewSet, basename='arquivo')

urlpatterns = [
    path('cadastro/', RegistroUsuarioView.as_view(), name='cadastro'),
    path('', include(router.urls)),
]