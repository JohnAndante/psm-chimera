# ⚙️ Environment Setup - PSM Chimera

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento e produção do PSM Chimera.

---

## 📋 Pré-requisitos

### Sistema Operacional

- **Linux:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+

### Software Essencial

- **Node.js:** 20.x LTS
- **npm:** 9.x ou superior
- **Docker:** 24.x ou superior
- **Docker Compose:** 2.x ou superior
- **Git:** 2.x ou superior

---

## 🐳 Configuração com Docker (Recomendado)

### 1. Clone do Repositório

```bash
git clone https://github.com/JohnAndante/psm-chimera.git
cd psm-chimera
```

### 2. Configuração do Backend

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis conforme necessário
nano .env
```

### 3. Variáveis de Ambiente - Backend

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:masterkey@localhost:5432/psm_chimera

# Node Environment
NODE_ENV=development
PORT=3000
```

### 4. Executar Setup

```bash
# Subir PostgreSQL e executar migrations
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

---

## 🖥️ Configuração Manual (Desenvolvimento)

### 1. Instalação do Node.js

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Instalação do PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuário
sudo -u postgres psql
CREATE DATABASE psm_chimera;
CREATE USER postgres WITH PASSWORD 'masterkey';
GRANT ALL PRIVILEGES ON DATABASE psm_chimera TO postgres;
\q
```

### 3. Setup do Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
nano .env

# Executar migrations
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# Executar seed (se disponível)
npm run db:seed
```

---

## 🔧 Server-Node-Fill Setup

### 1. Configuração do Ambiente

```bash
cd server-node-fill

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

### 2. Variáveis de Ambiente - Server-Node-Fill

```env
# Server Configuration
HOSTNAME=localhost
PORT=3344

# Database URLs
DATABASE_URL="file:./dev.db"
DEV_DATABASE_URL="postgresql://postgres:paranasuper@192.168.1.59:5432/dev_db"
PROD_DATABASE_URL="postgresql://postgres:paranasuper@192.168.1.59:5432/prod_db"

# RP API Configuration
RP_URL="http://192.168.1.4:9000"
RP_USER="100019"
RP_PASSWORD="xOLSkM"

# CresceVendas API Configuration
CV_URL="https://www.crescevendas.com"
CV_EMAIL="walker.silvestre@paranasuper.com.br"
CV_TOKEN="k_38zx7tnrpNYdg9UD38"

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="7077140332:AAGAf2XQBSniUdGRA0gZrlCvmYXcjzpCCOs"
DANIEL_CHAT_ID="414688270"
WALKER_CHAT_ID="466735592"
FERNANDO_CHAT_ID="833682989"

# Email Configuration
WALKER_EMAIL="walker.silvestre@paranasuper.com.br"
WALKER_EMAIL_PASSWORD="885630QE"
```

### 3. Setup do Banco de Dados

```bash
# Para desenvolvimento (SQLite)
npm run dev

# Para produção (PostgreSQL)
npx prisma migrate deploy
npx prisma generate
```

### 4. Execução

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm run prod
```

---

## 🔐 Configuração de Segurança

### 1. Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp  # Backend
sudo ufw allow 3344/tcp  # Server-Node-Fill
sudo ufw allow 5432/tcp  # PostgreSQL (apenas local)

# Verificar status
sudo ufw status
```

### 2. PostgreSQL Security

```bash
# Editar configuração
sudo nano /etc/postgresql/14/main/postgresql.conf

# Configurações recomendadas
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB

# Reiniciar serviço
sudo systemctl restart postgresql
```

### 3. Backup Configuration

```bash
# Script de backup automático
#!/bin/bash
BACKUP_DIR="/opt/backups/psm-chimera"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco
pg_dump -h localhost -U postgres psm_chimera > "$BACKUP_DIR/psm_chimera_$DATE.sql"

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

---

## 🔍 Verificação da Instalação

### 1. Health Checks

```bash
# Verificar Node.js
node --version  # Should show v20.x.x

# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar Docker
docker --version
docker-compose --version
```

### 2. Teste de Conexões

```bash
# Testar conexão com banco
psql -h localhost -U postgres -d psm_chimera -c "SELECT version();"

# Testar APIs (se configuradas)
curl -X GET http://localhost:3000/health  # Backend
curl -X GET http://localhost:3344/        # Server-Node-Fill
```

### 3. Verificar Logs

```bash
# Backend logs
docker-compose logs backend

# Server-Node-Fill logs
tail -f server-node-fill/src/logs/log-$(date +%Y-%m-%d).txt
```

---

## 🚀 Configuração de Produção

### 1. Variáveis de Ambiente Produção

```env
# Production Backend
NODE_ENV=production
DATABASE_URL=postgresql://postgres:SECURE_PASSWORD@prod-db:5432/psm_chimera
PORT=3000

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/psm-chimera.crt
SSL_KEY_PATH=/etc/ssl/private/psm-chimera.key
```

### 2. Process Manager (PM2)

```bash
# Instalar PM2
npm install -g pm2

# Configurar aplicação
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'psm-chimera-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }, {
    name: 'psm-chimera-server',
    script: 'server-node-fill/dist/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 3344
    }
  }]
};
EOF

# Iniciar aplicações
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name psm-chimera.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/v1/server {
        proxy_pass http://localhost:3344;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 📊 Monitoramento

### 1. Application Monitoring

```bash
# Instalar ferramentas de monitoramento
npm install -g clinic

# Monitorar performance
clinic doctor -- node dist/index.js
clinic bubbleprof -- node dist/index.js
```

### 2. System Monitoring

```bash
# Instalar htop
sudo apt install htop

# Monitorar recursos
htop
sudo iotop
sudo nethogs
```

### 3. Log Monitoring

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/psm-chimera

# Conteúdo
/opt/psm-chimera/logs/*.txt {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 app app
}
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Testar conexão manual
psql -h localhost -U postgres -d psm_chimera
```

#### 2. Erro de Permissions

```bash
# Corrigir permissões de arquivos
sudo chown -R $USER:$USER /opt/psm-chimera
chmod +x scripts/*.sh
```

#### 3. Port Already in Use

```bash
# Verificar quem está usando a porta
sudo lsof -i :3000
sudo lsof -i :3344

# Matar processo se necessário
sudo kill -9 <PID>
```

### Logs de Debug

```bash
# Aumentar nível de log
export DEBUG=*
export LOG_LEVEL=debug

# Executar com logs verbosos
npm run dev 2>&1 | tee debug.log
```

---

## 📚 Scripts Úteis

### 1. Setup Completo

```bash
#!/bin/bash
# setup.sh - Setup completo do ambiente

echo "🚀 Iniciando setup do PSM Chimera..."

# Verificar pré-requisitos
command -v node >/dev/null 2>&1 || { echo "Node.js não encontrado"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker não encontrado"; exit 1; }

# Backend setup
cd backend
npm install
cp .env.example .env
docker-compose up -d

# Server-Node-Fill setup
cd ../server-node-fill
npm install
cp .env.example .env

echo "✅ Setup concluído!"
echo "📋 Próximos passos:"
echo "1. Configurar variáveis de ambiente nos arquivos .env"
echo "2. Executar 'npm run dev' em cada projeto"
```

### 2. Backup Script

```bash
#!/bin/bash
# backup.sh - Script de backup

BACKUP_DIR="/opt/backups/psm-chimera"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U postgres psm_chimera > "$BACKUP_DIR/db_$DATE.sql"

# Backup dos logs
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" server-node-fill/src/logs/

# Backup da configuração
cp backend/.env "$BACKUP_DIR/backend_env_$DATE"
cp server-node-fill/.env "$BACKUP_DIR/server_env_$DATE"

echo "✅ Backup criado em $BACKUP_DIR"
```

### 3. Health Check Script

```bash
#!/bin/bash
# health-check.sh - Verificação de saúde

echo "🔍 Verificando saúde do sistema..."

# Verificar serviços
systemctl is-active postgresql && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL FAIL"

# Verificar portas
nc -z localhost 3000 && echo "✅ Backend OK" || echo "❌ Backend FAIL"
nc -z localhost 3344 && echo "✅ Server-Node-Fill OK" || echo "❌ Server-Node-Fill FAIL"

# Verificar disk space
df -h | grep -E "(/$|/opt)" | awk '{print $5 " " $6}' | while read output;
do
  usage=$(echo $output | awk '{print $1}' | sed 's/%//g')
  partition=$(echo $output | awk '{print $2}')
  if [ $usage -ge 90 ]; then
    echo "❌ Disk space critical on $partition: $usage%"
  else
    echo "✅ Disk space OK on $partition: $usage%"
  fi
done
```

---

*Guia de configuração do ambiente PSM Chimera*
*Última atualização: 22 de setembro de 2025*
