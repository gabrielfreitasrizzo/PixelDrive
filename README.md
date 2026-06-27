# PixelDrive

Aplicação web de gerenciamento de arquivos, desenvolvida como teste técnico para a vaga de Desenvolvimento Web Júnior na Pixel Breeders.

Permite que usuários autenticados façam upload, listem, baixem e excluam seus próprios arquivos, com isolamento total entre contas.

## Acesso em produção

- App: [https://pixel-drive.vercel.app/](https://pixel-drive.vercel.app/)
- API: [https://pixeldrive.onrender.com/admin/](https://pixeldrive.onrender.com/admin/)

> **Nota sobre o primeiro acesso:** o backend está hospedado no tier gratuito do Render, que hiberna o serviço após um período de inatividade. Por isso, a primeira requisição após um tempo sem uso pode levar de 30 a 60 segundos para responder, enquanto o serviço é "acordado". Requisições seguintes voltam a ser instantâneas.
>
> Para acessar o admin do Django em produção ([https://pixeldrive.onrender.com/admin/](https://pixeldrive.onrender.com/admin/)), utilize o superusuário criado automaticamente pela própria aplicação na inicialização (ver seção [Decisões técnicas](#decisões-técnicas) — criação automática de superusuário).

## Stack

- **Frontend:** React + TypeScript + Vite, React Router, Axios
- **Backend:** Django + Django REST Framework
- **Autenticação:** JWT (`djangorestframework-simplejwt`)
- **Banco de dados:** PostgreSQL
- **Storage:** Local (filesystem) ou AWS S3, configurável por variável de ambiente
- **Infraestrutura:** Docker + Docker Compose

## Como rodar localmente

### Pré-requisitos
- Docker e Docker Compose instalados

### Passo a passo

1. Clone o repositório:
```bash
   git clone https://github.com/gabrielfreitasrizzo/PixelDrive.git
   cd PixelDrive
```

2. Crie os arquivos de ambiente a partir dos exemplos:
```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
```

3. Preencha os valores nos dois arquivos `.env` (qualquer valor serve para `SECRET_KEY`, `DB_PASSWORD`, etc. — são apenas para o ambiente local de avaliação). As variáveis `AWS_*` podem ficar em branco — neste caso, a aplicação usa armazenamento local automaticamente (mais detalhes na seção [Storage](#storage-local-ou-s3)).

4. Suba os containers:
```bash
   docker compose up --build
```

5. Acesse:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Admin do Django: [http://localhost:8000/admin/](http://localhost:8000/admin/)
   - Documentação da API (Swagger UI): [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
   - Documentação da API (ReDoc): [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)

> A API expõe documentação interativa gerada automaticamente a partir do código (via `drf-spectacular`), em dois formatos: **Swagger UI**, que permite autenticar com um token JWT e testar os endpoints diretamente pelo navegador, e **ReDoc**, com uma leitura mais limpa de toda a especificação. Optei por incluir os dois porque o endpoint raiz padrão da API (`/api/`) gerado pelo DRF não é navegável sem autenticação por sessão — incompatível com a autenticação via JWT usada neste projeto.

Um superusuário é criado automaticamente na primeira inicialização, usando as credenciais definidas em `DJANGO_SUPERUSER_*` no `backend/.env`.

> **Por que os `.env` não estão no repositório:** eles carregam segredos (chave do Django, senha do banco, credenciais AWS). Comitar esses arquivos, mesmo com valores fictícios, não é uma prática recomendada — por isso optei por mantê-los fora do controle de versão, documentando exatamente quais variáveis são necessárias através dos arquivos `.env.example`.

## Arquitetura

```
PixelDrive/
├── backend/                → Django + DRF (API REST)
│   ├── core/               → configurações do projeto (settings, urls)
│   └── gestao_arquivos/    → app principal (models, views, serializers)
├── frontend/               → React + TypeScript (Vite)
│   └── src/
│       ├── pages/          → telas (Login, Cadastro, Home)
│       ├── components/     → componentes reutilizáveis (Header, ProtectedRoute, Modal, AlertBanner, UploadForm, ArquivosTable)
│       ├── contexts/       → contexto de autenticação
│       └── services/       → comunicação com a API (auth, arquivos)
└── docker-compose.yml      → orquestração dos serviços (backend, frontend, banco)
```

A comunicação entre frontend e backend é feita via API REST (JSON), com autenticação por token JWT enviado no header `Authorization`. O frontend não acessa o banco de dados ou o storage diretamente — toda regra de negócio e validação de acesso fica centralizada no backend.

## Decisões técnicas

- **Isolamento de arquivos por usuário:** toda consulta de arquivo (`listagem`, `download`, `delete`) é filtrada por `usuario=request.user` diretamente no `queryset` da view. Isso garante que tentar acessar um arquivo de outro usuário retorna `404` (não `403`), evitando inclusive confirmar a existência do recurso para quem não é o dono.

- **Download via streaming:** o endpoint de download (`GET /api/arquivos/{id}/download/`) usa `FileResponse`, que faz streaming do arquivo em chunks, em vez de carregá-lo inteiro na memória do servidor.

- **Storage local ou S3 (configuração automática):** o backend decide qual storage usar com base na presença das variáveis de ambiente `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_STORAGE_BUCKET_NAME`. Se todas estiverem definidas, o S3 é usado; caso contrário, o sistema usa o filesystem local, sem nenhuma mudança de código necessária — apenas o `settings.py` decide isso dinamicamente. Essa decisão veio da necessidade real de deploy, onde plataformas como o Render não oferecem disco persistente, mas foi desenhada para não exigir credenciais AWS para rodar localmente via Docker.

- **Estáticos do admin via WhiteNoise:** como o backend roda com `gunicorn` (servidor de produção) em vez do `runserver` de desenvolvimento, os arquivos estáticos do Django Admin não são servidos automaticamente. Optei pelo `whitenoise` em vez de configurar um servidor separado (nginx) só para isso, por ser mais simples de manter dentro de um único container.

- **Login por e-mail, sem alterar o modelo de usuário:** o edital pede autenticação por e-mail e senha, mas optei por manter o modelo `User` padrão do Django em vez de criar um modelo customizado (o que exigiria uma migração mais invasiva). A solução adotada foi sincronizar `username` e `email` no momento do cadastro — o usuário sempre informa apenas o e-mail, que é salvo automaticamente também como `username`. Isso aproveita a constraint de unicidade já existente em `username` para garantir que e-mails não se repitam, sem precisar de validação redundante.

- **Criação automática de superusuário no Docker:** o `Dockerfile` do backend roda `createsuperuser --noinput` na inicialização, usando variáveis de ambiente (`DJANGO_SUPERUSER_*`). Isso evita que quem for avaliar o projeto precise executar um comando manual extra dentro do container só para acessar o admin — vale tanto localmente quanto no deploy em produção.

- **Validação de upload duplicada (frontend e backend):** tipo e tamanho do arquivo são validados tanto no frontend (feedback imediato ao usuário, sem esperar uma chamada à API) quanto no backend (porque a validação no cliente nunca deve ser a única linha de defesa).

## Storage: local ou S3

O projeto funciona com dois backends de armazenamento, escolhidos automaticamente:

| Cenário | Comportamento |
|---|---|
| Variáveis `AWS_*` vazias no `.env` | Arquivos salvos em `backend/media/uploads/` |
| Variáveis `AWS_*` preenchidas | Arquivos enviados para o bucket S3 configurado |

Nenhuma alteração de código é necessária para alternar entre os dois — apenas a configuração de ambiente.

## Funcionalidades implementadas

- [x] Cadastro e login com autenticação JWT (por e-mail e senha)
- [x] Sessão persistente (token salvo no `localStorage`)
- [x] Feedback visual de sucesso e erro em cadastro, login, upload e exclusão de arquivos
- [x] Upload de arquivos (.png, .jpg, .pdf, .txt — máx. 10MB), com validação client-side e server-side
- [x] Feedback de progresso de upload
- [x] Listagem de arquivos (nome, tamanho, data)
- [x] Download de arquivos (com streaming)
- [x] Exclusão de arquivos (com confirmação via modal)
- [x] Isolamento de acesso entre usuários
- [x] Armazenamento local ou S3 (bônus)
- [x] Execução completa via Docker Compose, com banco de dados persistido em volume
- [x] Deploy em produção integrando Vercel + Render + Supabase + AWS S3

## Funcionalidades não implementadas

- [ ] **Upload com streaming** — entre os dois sentidos de streaming possíveis (upload e download), priorizei o download via `FileResponse`, por ser o caso com maior benefício prático: evita que o servidor carregue arquivos grandes inteiros na memória ao serem baixados por múltiplos usuários simultaneamente. O upload, por ser uma operação pontual e de tamanho limitado (máx. 10MB pelo próprio requisito do teste), não apresenta o mesmo risco de consumo de memória, o que tornou o streaming nesse sentido uma prioridade mais baixa frente às demais funcionalidades.

- [ ] **Links de download com expiração** — o controle de acesso ao download já é resolvido pela autenticação JWT, validada a cada requisição e combinada ao isolamento por usuário no backend. Implementar URLs assinadas com expiração agregaria uma camada adicional de segurança (útil sobretudo para compartilhamento de links fora da aplicação), mas não corrige uma lacuna de segurança existente hoje — por isso priorizei consolidar bem o fluxo de autenticação já implementado em vez de adicionar essa camada extra.

- [ ] **Preview de imagens** — optei por concentrar o tempo disponível em garantir a robustez do fluxo principal (upload, storage híbrido local/S3, deploy completo) e na qualidade da documentação técnica, em vez de adicionar uma funcionalidade de UI que não impacta a integridade ou segurança do sistema.

- [ ] **Versionamento de arquivos** — avaliei essa funcionalidade, mas decidi não implementá-la: ela exigiria uma modificação estrutural no modelo de dados (suportar múltiplas versões por arquivo lógico, com histórico e possivelmente regras de retenção), o que mudaria significativamente o escopo de modelagem do projeto. Entendi que essa complexidade adicional não se justificava frente às demais prioridades dentro do tempo disponível.

- [ ] **Cache** — o volume de dados e o padrão de acesso de um sistema de gerenciamento de arquivos pessoal (poucos arquivos por usuário, baixa frequência de releitura da mesma listagem) não demonstrou, durante o desenvolvimento, um ganho de performance que justificasse a complexidade adicional de uma camada de cache nesta fase do projeto.

## Uso de IA

Utilizei o Claude (Anthropic) como apoio durante o desenvolvimento, principalmente para:
- Revisão de código e identificação de problemas de segurança (ex: validação de download apenas pelo `MEDIA_URL` sem checar o dono do arquivo)
- Discussão de decisões de arquitetura (ex: storage local vs. S3, considerando o plano de deploy em Render/Vercel/Supabase)
- Diagnóstico de erros de configuração do Docker (permissões, variáveis de ambiente, WhiteNoise)

Todas as decisões técnicas foram compreendidas e validadas individualmente por mim antes de serem aplicadas ao projeto.

## Deploy

- Frontend: [Vercel](https://pixel-drive.vercel.app/)
- Backend: [Render](https://pixeldrive.onrender.com/admin/)
- Banco de dados: Supabase
- Storage: AWS S3