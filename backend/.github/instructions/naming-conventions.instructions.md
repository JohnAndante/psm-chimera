---
applyTo: '**'
description: 'Naming conventions and standards for files, classes, methods, and database entities in the backend project.'
---

# 🏷️ Naming Conventions Guidelines

## 📋 **Convenções de Nomenclatura**

### **📁 Arquivos**

#### **Controllers:**
```typescript
// ✅ CORRETO - PascalCase + .controller.ts
auth.controller.ts           → AuthController
integration.controller.ts    → IntegrationController
jobConfiguration.controller.ts → JobConfigurationController
store.controller.ts          → StoreController

// ❌ ERRADO
JobConfigurationController.ts  // Arquivo não deve ser PascalCase
authController.ts             // Falta .controller
auth-controller.ts            // Não usar kebab-case
```

#### **Services:**
```typescript
// ✅ CORRETO - camelCase + .service.ts
auth.service.ts              → authService (singleton)
integration.service.ts       → integrationService
jobConfiguration.service.ts  → jobConfigurationService
store.service.ts             → storeService

// ❌ ERRADO - Arquivos duplicados encontrados:
JobConfigurationService.ts   // PascalCase incorreto
jobConfiguration.service.ts  // camelCase correto
// ESCOLHER: jobConfiguration.service.ts
```

#### **Routes:**
```typescript
// ✅ CORRETO - camelCase/kebab-case + .route.ts
auth.route.ts
integrations.route.ts        // Plural
jobs.config.route.ts         // Hierárquico: jobs/config
jobs.exec.route.ts           // Hierárquico: jobs/exec
notifications.route.ts
stores.route.ts
```

#### **Types:**
```typescript
// ✅ CORRETO - camelCase + .type.ts
auth.type.ts
database.ts                  // Exceção: tipos de DB
environment.type.ts
integration.type.ts
```

### **🏗️ Classes e Interfaces**

#### **Controllers:**
```typescript
// ✅ CORRETO - PascalCase + Controller suffix
export class AuthController { }
export class IntegrationController { }
export class JobConfigurationController { }
export class NotificationChannelController { }
export class StoreController { }

// ❌ ERRADO
export class authController { }     // camelCase
export class Auth { }               // Sem suffix
export class AuthCtrl { }           // Abreviação
```

#### **Services:**
```typescript
// ✅ CORRETO - PascalCase class, camelCase instance
class AuthService { }
export const authService = new AuthService();

class IntegrationService { }
export const integrationService = new IntegrationService();

// ❌ ERRADO
export class authService { }        // camelCase class
export const AuthService = new AuthService();  // PascalCase instance
```

#### **Types/Interfaces:**
```typescript
// ✅ CORRETO - PascalCase + Table/Type suffix
export interface UserTable { }
export interface AuthTable { }
export interface IntegrationTable { }
export type UserType = 'ADMIN' | 'USER';
export type IntegrationType = 'RP' | 'CRESCEVENDAS';

// ❌ ERRADO
export interface user { }           // camelCase
export interface User { }           // Sem suffix
export type userType = 'admin';     // camelCase + lowercase values
```

### **📊 Database/Fields**

#### **Tabela no Banco (snake_case):**
```sql
users
authentications
integrations
integration_keys
job_configurations
job_executions
notification_channels
stores
```

#### **Campos no Banco (snake_case):**
```sql
id
user_id
integration_id
job_config_id
created_at
updated_at
deleted_at
password_hash
base_url
error_details
cron_pattern
```

#### **Interfaces TypeScript:**
```typescript
// ✅ CORRETO - camelCase nas interfaces (Kysely convert automaticamente alguns)
export interface UserTable {
    id?: number;
    email: string;
    createdAt: Date;        // Pode ser camelCase
    updatedAt: Date;
    deletedAt: Date | null;
}

// ✅ CORRETO - snake_case quando não há conversão
export interface AuthTable {
    id?: number;
    user_id: number;        // FK mantém snake_case
    created_at: Date;       // Timestamps mantém snake_case
    updated_at: Date;
    deleted_at: Date | null;
}
```

### **🛣️ URLs e Routes**

#### **Endpoints (kebab-case/plural):**
```typescript
// ✅ CORRETO
/api/v1/auth/login
/api/v1/auth/change-password
/api/v1/integrations
/api/v1/integrations/:id/test
/api/v1/jobs/configurations     // Hierárquico
/api/v1/jobs/executions
/api/v1/notification-channels   // kebab-case para multi-word
/api/v1/stores

// ❌ ERRADO
/api/v1/Integration            // PascalCase
/api/v1/integration            // Singular (exceto casos específicos)
/api/v1/job_configurations     // snake_case
/api/v1/notificationChannels   // camelCase
```

#### **Parâmetros:**
```typescript
// ✅ CORRETO - camelCase
{ jobId, userId, integrationId }

// URL params - kebab-case ou camelCase
/integrations/:integration-id
/integrations/:integrationId   // Ambos aceitáveis
```

### **🔤 Métodos e Variáveis**

#### **Métodos de Controller:**
```typescript
// ✅ CORRETO - camelCase + ação clara
static async getAll(req, res) { }
static async getById(req, res) { }
static async create(req, res) { }
static async update(req, res) { }
static async delete(req, res) { }
static async testConnection(req, res) { }
static async changePassword(req, res) { }

// ❌ ERRADO
static async GetAll() { }           // PascalCase
static async get_all() { }          // snake_case
static async getAllEntities() { }   // Redundante
static async list() { }             // Não claro
```

#### **Métodos de Service:**
```typescript
// ✅ CORRETO - mesmo padrão
async findAll(): Promise<Entity[]> { }
async findById(id: number): Promise<Entity | null> { }
async create(data: Partial<Entity>): Promise<Entity> { }
async update(id: number, data: Partial<Entity>): Promise<Entity | null> { }
async delete(id: number): Promise<boolean> { }
async findByName(name: string): Promise<Entity | null> { }

// ❌ ERRADO
async getAll() { }              // get vs find (preferir find)
async createEntity() { }        // Redundante
async remove() { }              // Usar delete
```

### **📦 Imports/Exports**

#### **Import Names:**
```typescript
// ✅ CORRETO
import { AuthController } from '../controllers/auth.controller';
import { authService } from '../services/auth.service';
import { UserTable, UserType } from '../types/database';
import { db } from '../factory/database.factory';
import { EnvFactory } from '../factory/environment.factory';

// ❌ ERRADO
import { AuthCtrl } from '../controllers/auth.controller';      // Abreviação
import { AuthService } from '../services/auth.service';        // PascalCase service
import * as AuthService from '../services/auth.service';       // Import *
```

#### **Export Patterns:**
```typescript
// ✅ CORRETO - Controllers
export class AuthController { }

// ✅ CORRETO - Services (singleton)
class AuthService { }
export const authService = new AuthService();

// ✅ CORRETO - Routes
const router = Router();
export default router;

// ✅ CORRETO - Types
export interface UserTable { }
export type UserType = 'ADMIN' | 'USER';
```

## 🔧 **Resolução de Duplicações Atuais**

### **Services Duplicados:**
```bash
# ENCONTRADO:
jobConfiguration.service.ts     ✅ MANTER - padrão correto
JobConfigurationService.ts      ❌ REMOVER - PascalCase incorreto

# AÇÃO: Consolidar conteúdo no arquivo camelCase
```

### **Controllers com Nomes Inconsistentes:**
```bash
# ATUAL:
JobConfigurationController.ts   ✅ OK - PascalCase no nome da classe
JobExecutionController.ts       ✅ OK
NotificationChannelController.ts ✅ OK
StoreController.ts              ✅ OK

# Arquivo deve ser camelCase, mas classe PascalCase:
# jobConfiguration.controller.ts → JobConfigurationController
```

## ⚠️ **Regras Críticas:**

1. **Arquivos:** camelCase + sufixo (`.controller.ts`, `.service.ts`)
2. **Classes:** PascalCase + sufixo (`AuthController`, `AuthService`)
3. **Instances:** camelCase singleton (`authService`, `integrationService`)
4. **Types:** PascalCase + sufixo (`UserTable`, `UserType`)
5. **URLs:** kebab-case + plural (`/integrations`, `/notification-channels`)
6. **Métodos:** camelCase + ação clara (`getById`, `findByName`, `testConnection`)
7. **Database:** snake_case (tabelas e campos)
8. **Resolver duplicações** imediatamente

## 📋 **Checklist de Nomenclatura:**

- [ ] Controller class é PascalCase + Controller
- [ ] Service class é PascalCase, instance é camelCase
- [ ] Arquivo é camelCase + sufixo
- [ ] Métodos são camelCase + ação clara
- [ ] Types são PascalCase + sufixo
- [ ] URLs são kebab-case + plural
- [ ] Sem duplicações
- [ ] Imports/exports consistentes
