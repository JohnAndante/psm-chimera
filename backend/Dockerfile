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
COPY database/prisma ./database/prisma
COPY src/ ./src/
COPY package*.json ./

# Gerar Prisma Client (especificando o caminho do schema)
RUN npx prisma generate --schema=./database/prisma/schema.prisma

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3000

# Comando padrão: executar setup do banco e sair
CMD ["npm", "run", "db:setup"]
