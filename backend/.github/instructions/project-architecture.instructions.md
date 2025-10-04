---
applyTo: '**'
description: 'Project architecture and structure guidelines for PSM Chimera v2 backend.'
---

# 🏗️ PSM Chimera v2 - Project Architecture Guidelines

## 🎯 **Visão Geral do Projeto**

**PSM Chimera v2** é uma plataforma moderna de automação para sincronização de descontos entre sistemas ERP (RP), plataformas de ofertas (CresceVendas) e canais de notificação (Telegram).

### **📁 Estrutura do Projeto:**
```
backend/
├── src/
│   ├── controllers/     # Lógica de requisição/resposta
│   ├── services/        # Lógica de negócio
│   ├── routes/          # Definição de rotas
│   ├── types/           # Interfaces TypeScript
│   ├── factory/         # Factories (DB, Env, etc)
│   ├── utils/           # Utilitários
│   └── index.ts         # Entry point
├── database/
│   ├── generated/       # Prisma generated (tipos)
│   └── prisma/          # Schema e migrations
└── .github/
    └── instructions/    # Guidelines deste arquivo
```

## 🛠️ **Stack Tecnológica**

### **Stack Atual:**
- **TypeScript** - Linguagem principal
- **Express.js** - Framework web
- **Kysely** - Query builder principal para todo código de produção
- **Prisma** - Usado APENAS em database/seed.ts
- **PostgreSQL** - Database
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **queryMiddleware** - Sistema unificado de filtros/paginação

### **🚫 PADRÕES PROIBIDOS:**
- ❌ **Prisma em Services/Controllers** - Use apenas Kysely
- ❌ **try/catch em Controllers** - Use `.then()/.catch()` nos controllers
- ❌ **Lógica de negócio em Controllers** - Delegue para services
- ❌ **Queries diretas em Controllers** - Use services

### **✅ PADRÕES PERMITIDOS:**
- **ORM**: Kysely para todos os services e controllers
- **Prisma**: APENAS em database/seed.ts
- **Async Pattern**: Services podem usar async/await, Controllers usam promises

## 📐 **Arquitetura em Camadas**

### **1. Routes Layer**
- Definição de endpoints
- Middleware de autenticação
- Validação básica de parâmetros

### **2. Controllers Layer**
- Validação de entrada
- Orquestração de services
- Formatação de response
- Tratamento de erros

### **3. Services Layer**
- Lógica de negócio
- Queries no banco (via Kysely)
- Validações complexas
- Integrações externas

### **4. Data Layer**
- Database Factory (Kysely)
- Type definitions
- Environment Factory

## 🔧 **Padrões Obrigatórios**

### **Imports:**
```typescript
// ✅ Imports padrão
import { Controller } from '../controllers/entity.controller';
import { service } from '../services/entity.service';
import { db } from '../factory/database.factory';
```

### **Promises Pattern:**
```typescript
// ✅ USAR
return service.method()
    .then(result => {
        // success handling
    })
    .catch(error => {
        // error handling
    });

// ❌ NÃO USAR
try {
    const result = await service.method();
} catch (error) {
    // error handling
}
```

### **Database Queries:**
```typescript
// ✅ USAR - Kysely via db factory
return db.selectFrom('users')
    .selectAll()
    .where('active', '=', true)
    .where('deletedAt', 'is', null)
    .execute();

// ❌ NÃO USAR - Prisma (exceto em seed)
// const users = await prisma.user.findMany({ where: { active: true } });
import { db } from '../factory/database.factory.js';

db.selectFrom('table')
    .selectAll()
    .execute()
    .then(results => resolve(results))
    .catch(error => reject(error));

// ❌ NÃO USAR - Prisma Client direto
const results = await prisma.table.findMany();
```

### **Error Handling:**
```typescript
// ✅ Controllers
res.status(500).json({
    error: 'Erro interno do servidor'
});

// ✅ Services
return new Promise((resolve, reject) => {
    if (!param) {
        return reject(new Error('Parâmetro é obrigatório'));
    }
    // ... lógica
});
```

## 🌍 **Internacionalização**

### **✅ Português Brasileiro:**
- Todas as mensagens de erro
- Comentários no código
- Logs de sistema
- Documentação

### **❌ Evitar Inglês:**
- Mensagens para usuário
- Nomes de variáveis podem ser em inglês (padrão)

## 🔐 **Autenticação e Autorização**

### **Middleware Pattern:**
```typescript
// Todas as rotas protegidas
router.use(authenticateToken);

// Rotas que requerem admin
router.post('/', requireAdmin, Controller.create);
```

### **Types:**
```typescript
import { AuthenticatedRequest } from '../utils/auth.js';

static async method(req: AuthenticatedRequest, res: Response) {
    // req.user está disponível
}
```

## 📦 **Environment Management**

```typescript
// ✅ USAR
import { EnvFactory } from '../factory/environment.factory.js';

const dbUrl = EnvFactory.get('DATABASE_URL');
const isDev = EnvFactory.isDevelopment();

// ❌ NÃO USAR
const dbUrl = process.env.DATABASE_URL;
```

## 📊 **Response Patterns**

### **Success:**
```typescript
res.status(200).json({
    message: 'Operação realizada com sucesso',
    data: result
});
```

### **Error:**
```typescript
res.status(400).json({
    error: 'Mensagem de erro em português'
});
```

## 🎯 **Objetivos do Projeto**

1. **Modernização** do sistema legado `server-node-fill`
2. **Configurabilidade** dinâmica via UI
3. **Escalabilidade** e manutenibilidade
4. **Monitoramento** e observabilidade
5. **Flexibilidade** para futuras integrações

## ⚠️ **Regras Críticas**

1. **NUNCA usar Prisma Client** para queries - apenas Kysely
2. **SEMPRE português** nas mensagens de usuário
3. **SEMPRE `.then()/.catch()`** em vez de async/await
4. **SEMPRE validar** parâmetros de entrada
5. **SEMPRE usar** factories para DB e ENV
