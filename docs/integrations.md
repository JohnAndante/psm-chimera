# 🔗 Integrações e APIs - PSM Chimera

## 📋 Visão Geral

Este documento detalha todas as integrações externas e APIs utilizadas no sistema PSM Chimera.

---

## 1. API RP (Sistema de Retaguarda)

### 1.1 Configuração

```typescript
// Endpoint base
RP_URL="http://192.168.1.4:9000"
RP_USER="100019"
RP_PASSWORD="xOLSkM"
```

### 1.2 Endpoints Utilizados RP

#### 1.2.1. Autenticação

```http
POST /v1.1/auth
Content-Type: application/json

{
  "usuario": "100019",
  "senha": "xOLSkM"
}
```

**Resposta:**

```json
{
  "response": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 1.2.2. Buscar Produtos com Desconto

```http
GET /v2.8/produtounidade/listaprodutos/{lastProductId}/unidade/{storeReg}/detalhado?somentePreco2=true
Authorization: token {jwt_token}
```

**Parâmetros:**

- `lastProductId`: ID do último produto (para paginação)
- `storeReg`: CNPJ da loja
- `somentePreco2=true`: Apenas produtos com desconto

**Resposta:**

```json
{
  "status": "ok",
  "response": {
    "produtos": [
      {
        "Codigo": 12345,
        "Preco": 10.50,
        "Preco2": 8.90,
        "Limite": 5,
        "Descricao": "Produto Exemplo"
      }
    ]
  }
}
```

---

## 2. API CresceVendas

### 2.1. Configuração

```typescript
// Endpoint base
CV_URL="https://www.crescevendas.com"
CV_EMAIL="walker.silvestre@paranasuper.com.br"
CV_TOKEN="k_38zx7tnrpNYdg9UD38"
```

### 2.2. Headers de Autenticação

```typescript
const headers = {
  'X-AdminUser-Email': process.env.CV_EMAIL,
  'X-AdminUser-Token': process.env.CV_TOKEN,
};
```

### 2.3. Endpoints Utilizados

#### 2.3.1. Enviar Produtos para Desconto

```http
POST /admin/integrations/discount_stores/batch_upload
X-AdminUser-Email: walker.silvestre@paranasuper.com.br
X-AdminUser-Token: k_38zx7tnrpNYdg9UD38
Content-Type: application/json
```

**Body:**

```json
{
  "override": 1,
  "start_date": "2025-09-22T06:00",
  "end_date": "2025-09-22T23:59",
  "store_registrations": ["12345678000195"],
  "name": "001 Descontos - 2025-09-22 06:00",
  "discount_store_lines": [
    {
      "product_code": "12345",
      "discount_price": 8.90,
      "original_price": 10.50,
      "quantity_limit": 5
    }
  ]
}
```

#### 2.3.2. Consultar Produtos Ativos

```http
GET /admin/integrations/discount_stores?store_registration={cnpj}&start_date={start}&end_date={end}
X-AdminUser-Email: walker.silvestre@paranasuper.com.br
X-AdminUser-Token: k_38zx7tnrpNYdg9UD38
```

---

## 3. Telegram Bot API

### 3.1. Configuração

```typescript
TELEGRAM_BOT_TOKEN="7077140332:AAGAf2XQBSniUdGRA0gZrlCvmYXcjzpCCOs"
```

### 3.2. Usuários e Grupos

```typescript
const adminsMap = {
  Walker: 466735592,
  Fernando: 833682989,
  Daniel: 414688270,
};

const groupsMap = {
  'Grupo PSM': -1001174059969,
  'Log Magneto': -4103863449,
};
```

### 3.3. Funcionalidades Implementadas

#### 3.3.1. Envio de Mensagens

```typescript
bot.sendMessage(chatId, message, {
  parse_mode: 'Markdown',
  disable_web_page_preview: true
});
```

#### 3.3.2. Polling de Mensagens

```typescript
bot.on('message', async (msg) => {
  if (msg.from.is_bot) return;

  // Processa comando
  await processCommand(msg.text, msg.chat.id);
});
```

#### 3.3.3. Tratamento de Erros

```typescript
bot.on('polling_error', error => {
  console.error('Polling error:', error);
  bot.sendMessage(groupsMap['Log Magneto'], `Erro no polling: ${error}`);

  // Restart automático
  setTimeout(() => {
    bot.startPolling({ restart: true });
  }, 5000);
});
```

---

## 4. Nodemailer (Email)

### 4.1 Configuração

```typescript
WALKER_EMAIL="walker.silvestre@paranasuper.com.br"
WALKER_EMAIL_PASSWORD="885630QE"
```

### 4.2. Transporter Configuration

```typescript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.WALKER_EMAIL,
    pass: process.env.WALKER_EMAIL_PASSWORD
  }
});
```

### 4.3. Funcionalidades

#### 4.3.1. Envio de Email

```typescript
await transporter.sendMail({
  from: process.env.WALKER_EMAIL,
  to: 'destinatario@email.com',
  subject: 'Assunto do Email',
  text: 'Conteúdo do email',
  html: '<h1>Conteúdo HTML</h1>'
});
```

#### 4.3.2. Verificação de Emails (IMAP)

```typescript
const imap = new Imap({
  user: process.env.WALKER_EMAIL,
  password: process.env.WALKER_EMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

// Busca emails não lidos
imap.search(['UNSEEN'], (err, results) => {
  // Processa emails
});
```

---

## 5. Prisma Database

### 5.1. Configuração de Conexão

```typescript
// Desenvolvimento
DATABASE_URL="file:./dev.db"
DEV_DATABASE_URL="postgresql://postgres:paranasuper@192.168.1.59:5432/dev_db"

// Produção
PROD_DATABASE_URL="postgresql://postgres:paranasuper@192.168.1.59:5432/prod_db"
```

### 5.2. Schema Principal

```prisma
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DEV_DATABASE_URL")
}

model Store {
    id           Int       @id @default(autoincrement())
    name         String
    registration String    @unique
    cnpj         String    @default("")
    active       Boolean   @default(true)
    Product      Product[]
}

model Product {
    id          String   @id @default(uuid())
    code        Int
    price       Float
    final_price Float
    limit       Int
    store_id    Int
    starts_at   String?
    expires_at  String?
    created_at  DateTime @default(now())
    store       Store    @relation(fields: [store_id], references: [id])
}
```

---

## 6. Configurações de Rede

### 6.1 Timeouts e Retry

```typescript
// Configuração Axios para RP
const rpAxiosConfig = {
  timeout: 30000, // 30 segundos
  retry: 3,
  retryDelay: 1000
};

// Configuração Axios para CresceVendas
const cvAxiosConfig = {
  timeout: 60000, // 60 segundos
  retry: 2,
  retryDelay: 2000
};
```

### 6.2. Rate Limiting

```typescript
// Limite de requisições por minuto
const RATE_LIMIT = {
  RP_API: 60,        // 60 req/min
  CV_API: 30,        // 30 req/min
  TELEGRAM: 20       // 20 msg/min
};
```

---

## 7. Segurança e Autenticação

### 7.1 Tokens e Credenciais

```typescript
// Rotação automática de tokens RP
class RpService {
  private async refreshToken() {
    if (this.tokenExpired()) {
      await this.login();
    }
  }
}

// Validação de usuários Telegram
const validateTelegramUser = (userId: number) => {
  return Object.values(adminsMap).includes(userId);
};
```

### 7.2 Headers de Segurança

```typescript
// Headers padrão para APIs externas
const secureHeaders = {
  'User-Agent': 'PSM-Chimera/1.0',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};
```

---

## 8. Monitoramento de APIs

### 8.1. Health Checks

```typescript
// Verificação de saúde das APIs
const healthCheck = async () => {
  const results = {
    rp: await checkRpHealth(),
    crescevendas: await checkCvHealth(),
    telegram: await checkTelegramHealth(),
    database: await checkDatabaseHealth()
  };

  return results;
};
```

### 8.2. Métricas de Performance

```typescript
// Logging de performance
const logApiCall = (api: string, duration: number, success: boolean) => {
  const metric = {
    api,
    duration,
    success,
    timestamp: new Date().toISOString()
  };

  metricsLogger.log(metric);
};
```

---

## 9. Tratamento de Erros

### 9.1. Códigos de Erro Comuns

| API | Código | Descrição | Ação |
|-----|--------|-----------|------|
| RP | 401 | Token expirado | Renovar login |
| RP | 404 | Loja não encontrada | Validar CNPJ |
| CV | 429 | Rate limit | Aguardar e retry |
| CV | 500 | Erro interno | Retry com backoff |
| Telegram | 403 | Bot bloqueado | Notificar admin |

### 9.2. Estratégias de Recovery

```typescript
const handleApiError = async (error: AxiosError, api: string) => {
  switch (error.response?.status) {
    case 401:
      if (api === 'RP') await rpService.login();
      break;
    case 429:
      await delay(60000); // Aguarda 1 minuto
      break;
    case 500:
      await exponentialBackoff(error);
      break;
    default:
      throw error;
  }
};
```

---

## 10. Otimizações de Performance

### 10.1. Paginação Inteligente

```typescript
// Busca incremental para grandes volumes
const fetchAllProducts = async (storeReg: string) => {
  let allProducts = [];
  let lastProductId = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await rpService.getProducts(storeReg, lastProductId);

    if (batch.length === 0) {
      hasMore = false;
    } else {
      allProducts = [...allProducts, ...batch];
      lastProductId = batch[batch.length - 1].Codigo;
    }

    // Evita sobrecarga da API
    await delay(100);
  }

  return allProducts;
};
```

### 10.2. Cache Local

```typescript
// Cache em memória para reduzir calls
const cache = new Map();

const getCachedStores = async () => {
  if (cache.has('stores')) {
    return cache.get('stores');
  }

  const stores = await storeService.getAll();
  cache.set('stores', stores);

  // Expira cache em 1 hora
  setTimeout(() => cache.delete('stores'), 3600000);

  return stores;
};
```

---

## 11. Fluxo de Integração Completo

### 11.1 Sequência de Operações

1. **Inicialização**

   ```mermaid
   sequenceDiagram
       participant App as Application
       participant RP as RP API
       participant DB as Database
       participant CV as CresceVendas
       participant TG as Telegram

       App->>RP: Login (credenciais)
       RP-->>App: Token JWT
       App->>DB: Buscar lojas ativas
       DB-->>App: Lista de lojas
   ```

2. **Sincronização por Loja**

   ```mermaid
   sequenceDiagram
       participant App as Application
       participant RP as RP API
       participant DB as Database
       participant CV as CresceVendas
       participant TG as Telegram

       loop Para cada loja
           App->>RP: Buscar produtos (CNPJ)
           RP-->>App: Lista de produtos
           App->>DB: Limpar produtos antigos
           App->>DB: Inserir novos produtos
           App->>CV: Enviar campanha de desconto
           CV-->>App: Confirmação
           App->>TG: Notificar sucesso
       end
   ```

3. **Monitoramento Contínuo**

   ```mermaid
   sequenceDiagram
       participant Cron as Cron Job
       participant App as Application
       participant TG as Telegram
       participant Log as Log System

       Cron->>App: Trigger execução (05:10)
       App->>App: Executar fazTudo2
       App->>Log: Registrar progresso
       App->>TG: Notificar status

       Cron->>App: Trigger comparação (06:20)
       App->>App: Executar comparaTudo

       Cron->>App: Trigger limpeza (12:00)
       App->>App: Executar fazTudo3
   ```

---

*Documentação das integrações e APIs do PSM Chimera*
*Última atualização: 22 de setembro de 2025*
