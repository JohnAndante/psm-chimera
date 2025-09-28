---
applyTo: '**'
description: 'Guidelines for using factories in the backend project.'
---

# 🔧 Factory Usage Guidelines

## 📋 **Factories Obrigatórias**

### **🌍 Environment Factory**

#### **✅ SEMPRE Usar:**
```typescript
import { EnvFactory } from '../factory/environment.factory';

// ✅ CORRETO
const dbUrl = EnvFactory.get('DATABASE_URL');
const port = EnvFactory.getPort();
const isDev = EnvFactory.isDevelopment();

// ❌ ERRADO - nunca usar process.env diretamente
const dbUrl = process.env.DATABASE_URL;
```

#### **Métodos Disponíveis:**
```typescript
// Obter variável específica
EnvFactory.get('DATABASE_URL')      // string
EnvFactory.get('JWT_SECRET')        // string | undefined
EnvFactory.get('NODE_ENV')          // 'development' | 'production' | 'test'

// Métodos utilitários
EnvFactory.getPort()                // number (3000 default)
EnvFactory.isDevelopment()          // boolean
EnvFactory.isProduction()           // boolean
EnvFactory.isTest()                 // boolean
```

#### **Variáveis Disponíveis:**
```typescript
// Obrigatórias
DATABASE_URL: string;

// Opcionais com defaults
SERVER_PORT?: string;                      // default: '3000'
NODE_ENV?: 'development' | 'production' | 'test';  // default: 'development'

// Auth
JWT_SECRET?: string;
JWT_EXPIRES_IN?: string;           // default: '7d'

// APIs Externas
RP_API_URL?: string;
RP_API_KEY?: string;
CRESCEVENDAS_API_URL?: string;
CRESCEVENDAS_API_KEY?: string;

// Notificações
TELEGRAM_BOT_TOKEN?: string;
TELEGRAM_CHAT_ID?: string;
SMTP_HOST?: string;
SMTP_PORT?: string;
SMTP_USER?: string;
SMTP_PASS?: string;

// Logging
LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';  // default: 'info'
```

### **🗃️ Database Factory**

#### **✅ SEMPRE Usar:**
```typescript
import { db } from '../factory/database.factory';

// ✅ CORRETO - Kysely queries
const users = await db.selectFrom('users').selectAll().execute();

// ❌ ERRADO - NUNCA usar Prisma Client
import { PrismaClient } from '../../database/generated/prisma';
const prisma = new PrismaClient();
```

#### **Query Patterns:**
```typescript
// SELECT
const result = db.selectFrom('users')
    .selectAll()
    .where('deletedAt', 'is', null)
    .execute();

// INSERT
const newUser = db.insertInto('users')
    .values({
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
    })
    .returningAll()
    .executeTakeFirstOrThrow();

// UPDATE
const updated = db.updateTable('users')
    .set({
        name: 'New Name',
        updatedAt: new Date()
    })
    .where('id', '=', userId)
    .where('deletedAt', 'is', null)
    .returningAll()
    .executeTakeFirst();

// SOFT DELETE
const deleted = db.updateTable('users')
    .set({
        deletedAt: new Date()
    })
    .where('id', '=', userId)
    .execute();
```

#### **Joins:**
```typescript
const userWithAuth = db.selectFrom('users')
    .leftJoin('authentications', 'users.id', 'authentications.user_id')
    .select([
        'users.id',
        'users.email',
        'users.name',
        'authentications.active as auth_active'
    ])
    .where('users.id', '=', userId)
    .where('users.deletedAt', 'is', null)
    .executeTakeFirst();
```

## 🚫 **NÃO FAZER:**

### **❌ Environment:**
```typescript
// ERRADO - process.env direto
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// ERRADO - não validar variáveis obrigatórias
const dbUrl = process.env.DATABASE_URL;  // pode ser undefined
```

### **❌ Database:**
```typescript
// ERRADO - Prisma Client direto (apenas para tipos!)
import { PrismaClient } from '../../database/generated/prisma';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();

// ERRADO - não usar factory
import { Pool } from 'pg';
const pool = new Pool({ connectionString: dbUrl });
```

### **❌ Try/Catch:**
```typescript
// ERRADO - não usar async/await no service
try {
    const result = await db.selectFrom('users').execute();
    return result;
} catch (error) {
    throw error;
}
```

## ✅ **FAZER:**

### **✅ Environment no Controller:**
```typescript
import { EnvFactory } from '../factory/environment.factory';

export class SomeController {
    static async method(req: Request, res: Response) {
        // Verificar ambiente
        if (EnvFactory.isDevelopment()) {
            console.log('Debug info:', req.body);
        }

        // Usar configurações
        const jwtSecret = EnvFactory.get('JWT_SECRET');
        if (!jwtSecret) {
            return res.status(500).json({
                error: 'Configuração JWT não encontrada'
            });
        }
    }
}
```

### **✅ Database no Service:**
```typescript
import { db } from '../factory/database.factory';
import { UserTable } from '../types/database';

class UserService {
    async findById(id: number): Promise<UserTable | null> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.selectFrom('users')
                .selectAll()
                .where('id', '=', id)
                .where('deletedAt', 'is', null)
                .executeTakeFirst()
                .then(user => {
                    resolve(user || null);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}
```

### **✅ Logging Condicional:**
```typescript
import { EnvFactory } from '../factory/environment.factory';

// Log apenas em desenvolvimento
if (EnvFactory.isDevelopment()) {
    console.log('🔍 Query executada:', query);
}

// Log baseado no nível
const logLevel = EnvFactory.get('LOG_LEVEL') || 'info';
if (logLevel === 'debug') {
    console.debug('Debug info:', data);
}
```

### **✅ Configuração de APIs Externas:**
```typescript
import { EnvFactory } from '../factory/environment.factory';

class RPService {
    private getApiConfig() {
        const baseUrl = EnvFactory.get('RP_API_URL');
        const apiKey = EnvFactory.get('RP_API_KEY');

        if (!baseUrl || !apiKey) {
            throw new Error('Configuração da API RP não encontrada');
        }

        return { baseUrl, apiKey };
    }
}
```

## 🏭 **Inicialização das Factories**

### **Environment Factory:**
```typescript
// Carregamento automático no import
import { EnvFactory } from '../factory/environment.factory';

// Validação automática de variáveis obrigatórias
// Se DATABASE_URL não existir, aplicação falha na inicialização
```

### **Database Factory:**
```typescript
// Singleton pattern - conexão única
import { db } from '../factory/database.factory';

// Primeira query inicializa a conexão
// Pool de conexões gerenciado automaticamente
```

## ⚠️ **Regras Críticas:**

1. **NUNCA** usar `process.env` diretamente - SEMPRE `EnvFactory.get()`
2. **NUNCA** usar Prisma Client para queries - APENAS Kysely via `db`
3. **SEMPRE** usar `.then()/.catch()` nos services
4. **SEMPRE** validar variáveis obrigatórias
5. **SEMPRE** usar factories como singleton
6. **SEMPRE** logs condicionais baseados no ambiente

## 📊 **Troubleshooting:**

### **Erro "DATABASE_URL não encontrada":**
```bash
# Verificar se .env existe e tem DATABASE_URL
cat backend/.env

# Se não existir, criar:
echo "DATABASE_URL=postgresql://postgres:masterkey@localhost:5432/psm_chimera" > backend/.env
```

### **Logs de Debug:**
```typescript
// Ver configuração carregada
console.log('Env loaded:', EnvFactory.isDevelopment());

// Ver queries executadas (apenas dev)
if (EnvFactory.isDevelopment()) {
    // Logs automáticos já configurados no database.factory
}
```
