# 🐳 Docker Setup - PSM Chimera

Este documento fornece informações detalhadas sobre a configuração Docker do projeto PSM Chimera.

---

## 🏗️ Arquitetura Docker

O projeto utiliza uma arquitetura multi-container com:

- **PostgreSQL** - Banco de dados principal
- **Backend Setup** - Container de inicialização do banco
- **Server Node Fill** - Aplicação principal (quando necessário)

---

## 📂 Estrutura de Arquivos Docker

```text
backend/
├── Dockerfile                 # Container principal do backend
├── docker-compose.yaml        # Orquestração dos serviços
├── .dockerignore              # Arquivos ignorados no build
└── .env                       # Variáveis de ambiente
```

---

## 🔧 Dockerfile - Backend

### Multi-stage Build

```dockerfile
# ======================================================
# 🐳 DOCKERFILE - PSM CHIMERA BACKEND
# ======================================================

FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache openssl curl postgresql-client

WORKDIR /app

# ======================================================
# 📦 DEPENDENCIES STAGE
# ======================================================
FROM base AS deps

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# ======================================================
# 🚀 PRODUCTION STAGE
# ======================================================
FROM base AS production

WORKDIR /app

# Copiar dependências
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY package*.json ./
COPY src/ ./src/

# Gerar Prisma Client
RUN npx prisma generate --schema=./src/database/prisma/schema.prisma

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta (opcional, só para referência)
EXPOSE 3000

# Comando padrão: executar setup do banco e sair
CMD ["npm", "run", "db:setup"]
```

### Características do Dockerfile

- **Base Image:** `node:20-alpine` (leve e segura)
- **Multi-stage:** Otimiza tamanho final da imagem
- **Security:** Usuário não-root para execução
- **Dependencies:** Instala apenas o necessário para Prisma
- **Purpose:** Container de setup que executa e termina

---

## 🐳 Docker Compose

### Configuração Principal

```yaml
services:

  # ======================================================
  # 🗄️ BANCO DE DADOS POSTGRESQL
  # ======================================================
  postgres:
    image: postgres:17.0
    container_name: psm-chimera-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: psm_chimera
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: masterkey
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - psm-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d psm_chimera"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ======================================================
  # 🔧 SETUP DO BANCO (MIGRATIONS + SEED) - JOB ÚNICO
  # ======================================================
  database-setup:
    build:
      context: .
      target: production
    container_name: psm-chimera-db-setup
    restart: "no"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:masterkey@postgres:5432/psm_chimera
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - psm-network

# ======================================================
# 🌐 NETWORKS
# ======================================================
networks:
  psm-network:
    driver: bridge

# ======================================================
# 💾 VOLUMES
# ======================================================
volumes:
  postgres_data:
    driver: local
```

### Características do Compose

- **PostgreSQL 17.0:** Versão mais recente e estável
- **Health Checks:** Garante que serviços estejam prontos
- **Persistent Storage:** Volume para dados do PostgreSQL
- **Network Isolation:** Rede dedicada para os serviços
- **Job Container:** database-setup executa uma vez e para

---

## 🚀 Comandos Docker

### Comandos Básicos

```bash
# Subir todos os serviços
docker-compose up -d

# Subir com rebuild
docker-compose up --build -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Comandos de Debug

```bash
# Logs específicos do banco
docker-compose logs postgres

# Logs do setup
docker-compose logs database-setup

# Entrar no container do banco
docker-compose exec postgres psql -U postgres -d psm_chimera

# Executar comando no container
docker-compose exec postgres bash
```

---

## 🔒 Variáveis de Ambiente

### Arquivo .env

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:masterkey@localhost:5432/psm_chimera

# Node Environment
NODE_ENV=production
SERVER_PORT=3000
```

### Variáveis Docker Compose

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://postgres:masterkey@postgres:5432/psm_chimera
```

**Nota:** No Docker, o hostname do banco é `postgres` (nome do serviço), não `localhost`.

---

## 📋 .dockerignore

```dockerignore
# ======================================================
# 🚫 DOCKERIGNORE PARA PSM-CHIMERA BACKEND
# ======================================================

# Dependências
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime
*.log
logs
*.pid
*.seed
*.pid.lock

# Diretórios de build e cache
.next
.nuxt
dist
build
.cache

# Arquivos de ambiente (serão copiados conforme necessário)
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE e editores
.vscode
.idea
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git
.gitignore
README.md

# Docker
Dockerfile*
docker-compose*.yml
.dockerignore

# Prisma gerado (será regenerado no container)
src/database/generated/

# Testes
coverage
.nyc_output
test-results

# Temporários
tmp
temp
.tmp
```

---

## 🎯 Fluxo de Execução

### 1. Build e Inicialização

```mermaid
graph TD
    A[docker-compose up] --> B[Build database-setup image]
    B --> C[Start postgres container]
    C --> D[Wait for postgres health check]
    D --> E[Start database-setup container]
    E --> F[Run npm run db:setup]
    F --> G[Generate Prisma Client]
    G --> H[Run migrations]
    H --> I[Run seed]
    I --> J[Container exits with code 0]
    J --> K[Only postgres remains running]
```

### 2. Estado Final

Após a execução completa:

- ✅ **PostgreSQL** - Rodando e saudável
- ✅ **Database** - Migrations aplicadas
- ✅ **Seeds** - Dados iniciais inseridos
- ✅ **database-setup** - Container finalizou (exit code 0)

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Container database-setup fica reiniciando

**Causa:** Configuração `restart: unless-stopped` estava fazendo o container reiniciar após completar.

**Solução:** Alterado para `restart: "no"` para permitir que o container termine após completar o setup.

#### 2. Erro "Prisma Schema not found"

**Causa:** Caminho incorreto do schema no comando Prisma.

**Solução:** Especificar caminho completo:

```bash
npx prisma generate --schema=./src/database/prisma/schema.prisma
```

#### 3. Container não consegue conectar no banco

**Causa:** Banco ainda não está pronto quando o setup tenta conectar.

**Solução:** Usar `depends_on` com health check:

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

### ℹ️ Comandos de Debug

```bash
# Verificar se o banco está aceitando conexões
docker-compose exec postgres pg_isready -U postgres

# Conectar diretamente no banco
docker-compose exec postgres psql -U postgres -d psm_chimera

# Verificar tables criadas
docker-compose exec postgres psql -U postgres -d psm_chimera -c "\dt"

# Ver logs detalhados
docker-compose logs database-setup | tail -50
```

---

## 📊 Monitoramento

### Health Checks

```yaml
# PostgreSQL Health Check
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d psm_chimera"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Verificação Manual

```bash
# Verificar health do postgres
docker inspect psm-chimera-postgres | grep -A 10 Health

# Status dos containers
docker-compose ps -a

# Usar health check manual
docker-compose exec postgres pg_isready -U postgres -d psm_chimera
```

---

## 🔧 Configurações Avançadas

### Network Configuration

```yaml
networks:
  psm-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Volume Configuration

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/psm-chimera/data
```

### Environment Overrides

```yaml
# Para desenvolvimento
environment:
  NODE_ENV: development
  LOG_LEVEL: debug
  DATABASE_URL: postgresql://postgres:masterkey@postgres:5432/psm_chimera_dev
```

---

## 🚀 Deploy em Produção

### Considerações

1. **Secrets Management:** Usar Docker Secrets ou ENV files externos
2. **Backup Strategy:** Configurar backup automático do volume PostgreSQL
3. **Monitoring:** Adicionar containers de monitoramento (Prometheus, Grafana)
4. **SSL/TLS:** Configurar certificados para conexões seguras

### Exemplo com Secrets

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    external: true
```

---

## 📈 Otimizações

### Build Optimization

```dockerfile
# Use cache mount para node_modules
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Multi-stage para reduzir tamanho
FROM node:20-alpine AS runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
```

### Performance Tuning

```yaml
# PostgreSQL performance tuning
postgres:
  environment:
    - POSTGRES_SHARED_PRELOAD_LIBRARIES=pg_stat_statements
    - POSTGRES_MAX_CONNECTIONS=100
    - POSTGRES_SHARED_BUFFERS=256MB
```

---

*Documentação Docker do PSM Chimera*
*Última atualização: 22 de setembro de 2025*
