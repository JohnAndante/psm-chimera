---
applyTo: '**'
description: 'Typescript interfaces and types for database tables in PSM Chimera v2 backend.'
---

# 🗃️ Database Types Guidelines

## 📋 **Tipos do Banco de Dados**

### **📁 Localização:** `src/types/database.ts`

### **✅ Interfaces de Tabela**

#### **UserTable:**
```typescript
export interface UserTable {
    id?: number;        // Optional para INSERT, obrigatório para SELECT
    email: string;
    name: string | null;
    role: UserType;     // Enum: 'ADMIN' | 'USER'
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;  // Soft delete
}
```

#### **AuthTable:**
```typescript
export interface AuthTable {
    id?: number;
    user_id: number;           // FK para UserTable
    email: string;
    password_hash: string;     // Hash bcrypt
    active: boolean;
    created_at: Date;         // snake_case (vem do DB)
    updated_at: Date;
    deleted_at: Date | null;
}
```

#### **IntegrationTable:**
```typescript
export interface IntegrationTable {
    id?: number;
    name: string;
    type: IntegrationType;     // 'RP' | 'CRESCEVENDAS' | 'TELEGRAM' | 'EMAIL' | 'WEBHOOK'
    base_url: string | null;
    email: string | null;
    password: string | null;
    config: unknown | null;    // JSON config específico
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
```

#### **JobConfigurationTable:**
```typescript
export interface JobConfigurationTable {
    id?: number;
    name: string;
    description: string | null;
    integration_id: number | null;  // FK opcional
    cron_pattern: string;           // Ex: "0 */2 * * *"
    job_type: JobType;             // 'SYNC_PRODUCTS' | 'COMPARE_DATA' | etc.
    config: unknown | null;        // JSON específico do job
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
```

#### **JobExecutionTable:**
```typescript
export interface JobExecutionTable {
    id: string;                    // UUID
    job_config_id: number;         // FK para JobConfigurationTable
    status: ExecutionStatus;       // 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
    started_at: Date;
    finished_at: Date | null;
    logs: string | null;           // Logs da execução
    error_details: string | null;  // Detalhes do erro se houver
    metrics: unknown | null;       // JSON com métricas
    created_at: Date;
    updated_at: Date;
}
```

### **🏷️ Enums/Types**

#### **Tipos de Usuário:**
```typescript
export type UserType = 'ADMIN' | 'USER';
```

#### **Tipos de Integração:**
```typescript
export type IntegrationType = 'RP' | 'CRESCEVENDAS' | 'TELEGRAM' | 'EMAIL' | 'WEBHOOK';
```

#### **Tipos de Job:**
```typescript
export type JobType = 'SYNC_PRODUCTS' | 'COMPARE_DATA' | 'CLEANUP_LOGS' | 'CUSTOM';
```

#### **Status de Execução:**
```typescript
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
```

#### **Tipos de Notificação:**
```typescript
export type NotificationType = 'TELEGRAM' | 'EMAIL' | 'WEBHOOK';
```

## 🔧 **Regras de Uso**

### **✅ ID Fields:**

#### **Para INSERTs:**
```typescript
// ✅ CORRETO - id é opcional
const newUser: UserTable = {
    email: 'user@example.com',
    name: 'Usuario',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
};

// ❌ ERRADO - não incluir id no insert
const newUser: UserTable = {
    id: 1,  // Não fazer isso
    email: 'user@example.com',
    // ...
};
```

#### **Para SELECTs/UPDATEs:**
```typescript
// ✅ CORRETO - id sempre presente em resultados
const user: UserTable = {
    id: 1,              // Sempre presente
    email: 'user@example.com',
    // ...
};
```

### **✅ Campos de Auditoria:**

#### **Timestamps:**
```typescript
// ✅ SEMPRE incluir em creates
created_at: new Date(),
updated_at: new Date()

// ✅ SEMPRE atualizar em updates
updated_at: new Date()
```

#### **Soft Delete:**
```typescript
// ✅ Para marcar como deletado
deletedAt: new Date()

// ✅ Para registros ativos
deletedAt: null

// ✅ Filtrar registros ativos
.where('deletedAt', 'is', null)
```

### **✅ Naming Convention:**

#### **Database Fields (snake_case):**
- `created_at`, `updated_at`, `deleted_at`
- `user_id`, `integration_id`, `job_config_id`
- `base_url`, `password_hash`, `error_details`

#### **TypeScript Interface (camelCase):**
- `createdAt`, `updatedAt`, `deletedAt` (quando aplicável)
- Kysely faz conversão automática em alguns casos

### **✅ Foreign Keys:**
```typescript
// ✅ SEMPRE tipado como number
user_id: number;        // FK para users.id
integration_id: number; // FK para integrations.id
job_config_id: number;  // FK para job_configurations.id

// ✅ FK opcional
integration_id: number | null;  // Job pode não ter integração
```

### **✅ JSON Fields:**
```typescript
// ✅ SEMPRE unknown (não any)
config: unknown | null;     // Configuração específica
metrics: unknown | null;    // Métricas de execução

// ✅ Cast quando necessário
const integrationConfig = integration.config as {
    api_key: string;
    endpoint: string;
};
```

## 🚫 **NÃO FAZER:**

### **❌ Tipos Incorretos:**
```typescript
// ERRADO - usar any
config: any;

// ERRADO - não especificar null
name: string;  // quando pode ser null no DB

// ERRADO - não usar enum
status: string;  // usar ExecutionStatus
```

### **❌ Naming Inconsistente:**
```typescript
// ERRADO - misturar convenções
interface UserTable {
    id: number;
    created_at: Date;  // snake_case
    updatedAt: Date;   // camelCase (inconsistente)
}
```

## ✅ **FAZER:**

### **✅ Import Correto:**
```typescript
import {
    UserTable,
    IntegrationType,
    JobType,
    ExecutionStatus
} from '../types/database';
```

### **✅ Validação de Enum:**
```typescript
const validTypes: IntegrationType[] = ['RP', 'CRESCEVENDAS', 'TELEGRAM', 'EMAIL', 'WEBHOOK'];

if (!validTypes.includes(type as IntegrationType)) {
    return res.status(400).json({
        error: 'Tipo de integração inválido'
    });
}
```

### **✅ Type Guards:**
```typescript
function isValidJobType(type: string): type is JobType {
    return ['SYNC_PRODUCTS', 'COMPARE_DATA', 'CLEANUP_LOGS', 'CUSTOM'].includes(type);
}
```

## ⚠️ **Regras Críticas:**

1. **SEMPRE** usar interfaces do `database.ts`
2. **NUNCA** usar `any` - usar `unknown` para JSON
3. **SEMPRE** `id?: number` para inserts
4. **SEMPRE** incluir campos de auditoria
5. **SEMPRE** usar soft delete (`deletedAt`)
6. **SEMPRE** validar enums antes de usar
