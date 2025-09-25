---
applyTo: '**'
description: 'Route registration guidelines and best practices for PSM Chimera v2 backend.'
---

# 🛣️ Route Registration Guidelines

## 📋 **Registro de Rotas no Sistema**

### **📁 Arquivo Principal:** `src/routes/index.ts`

### **✅ Estrutura Atual:**
```typescript
import { Router } from "express";

const router = Router();

import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';

// Prefixo /api/v1

router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);

export default router;
```

### **🚧 Rotas Pendentes de Registro:**

#### **Arquivos Criados mas NÃO Registrados:**
```typescript
// ❌ NÃO REGISTRADAS - precisam ser adicionadas ao index.ts
jobs.config.route.ts         // /api/v1/jobs/configurations
jobs.exec.route.ts           // /api/v1/jobs/executions
notifications.route.ts       // /api/v1/notifications
stores.route.ts              // /api/v1/stores
```

### **✅ Como Registrar Novas Rotas:**

#### **1. Import das Rotas:**
```typescript
import { Router } from "express";

const router = Router();

// ✅ Imports existentes
import authRoutes from './auth.route';
import integrationRoutes from './integrations.route';

// ✅ Imports pendentes
import jobConfigRoutes from './jobs.config.route';
import jobExecRoutes from './jobs.exec.route';
import notificationRoutes from './notifications.route';
import storeRoutes from './stores.route';
```

#### **2. Registro das Rotas:**
```typescript
// Prefixo /api/v1

// ✅ Rotas existentes
router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);

// ✅ Rotas pendentes
router.use('/jobs/configurations', jobConfigRoutes);
router.use('/jobs/executions', jobExecRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stores', storeRoutes);

export default router;
```

### **🎯 Padrões de URL**

#### **✅ Estrutura Hierárquica:**
```typescript
// Jobs (hierárquico)
/api/v1/jobs/configurations     // Configurações de jobs
/api/v1/jobs/executions         // Execuções de jobs

// Recursos independentes
/api/v1/integrations           // Integrações
/api/v1/notifications          // Canais de notificação
/api/v1/stores                 // Lojas
/api/v1/auth                   // Autenticação
```

#### **❌ Evitar:**
```typescript
// ERRADO - URLs muito longas
/api/v1/job-configurations
/api/v1/notification-channels

// ERRADO - Inconsistente
/api/v1/jobConfig
/api/v1/job_exec
```

### **📊 Mapeamento Arquivo → URL:**

| **Arquivo** | **URL** | **Recurso** |
|-------------|---------|-------------|
| `auth.route.ts` | `/auth` | Autenticação |
| `integrations.route.ts` | `/integrations` | Integrações |
| `jobs.config.route.ts` | `/jobs/configurations` | Config de Jobs |
| `jobs.exec.route.ts` | `/jobs/executions` | Execuções |
| `notifications.route.ts` | `/notifications` | Notificações |
| `stores.route.ts` | `/stores` | Lojas |

### **🔧 Template para Novas Rotas:**

#### **Estrutura Padrão do Arquivo:**
```typescript
import { Router } from 'express';
import { EntityController } from '../controllers/entity.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';

const router = Router();

// Middleware global (se necessário)
router.use(authenticateToken);

// Rotas públicas (se houver)
// router.get('/public-endpoint', EntityController.publicMethod);

// Rotas autenticadas
router.get('/', EntityController.getAll);
router.get('/:id', EntityController.getById);

// Rotas administrativas
router.post('/', requireAdmin, EntityController.create);
router.put('/:id', requireAdmin, EntityController.update);
router.delete('/:id', requireAdmin, EntityController.delete);

// Rotas de ação específica
router.post('/:id/custom-action', EntityController.customAction);

export default router;
```

#### **Registro no Index:**
```typescript
// 1. Import
import entityRoutes from './entity.route';

// 2. Register
router.use('/entities', entityRoutes);
```

### **🔒 Middleware de Autenticação:**

#### **Padrões por Tipo de Rota:**
```typescript
// Auth - algumas públicas, outras privadas
router.post('/login', AuthController.login);           // Público
router.get('/me', authenticateToken, AuthController.me); // Privado

// Resources - todas autenticadas, admin para CUD
router.use(authenticateToken);                         // Global
router.get('/', EntityController.getAll);             // Read: user
router.post('/', requireAdmin, EntityController.create); // Create: admin
```

### **📋 URLs Resultantes Finais:**

#### **Depois do Registro Completo:**
```bash
# Autenticação
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/change-password

# Integrações
GET    /api/v1/integrations
GET    /api/v1/integrations/:id
POST   /api/v1/integrations
PUT    /api/v1/integrations/:id
DELETE /api/v1/integrations/:id
POST   /api/v1/integrations/:id/test

# Jobs - Configurações
GET    /api/v1/jobs/configurations
GET    /api/v1/jobs/configurations/:id
POST   /api/v1/jobs/configurations
PUT    /api/v1/jobs/configurations/:id
DELETE /api/v1/jobs/configurations/:id

# Jobs - Execuções
GET    /api/v1/jobs/executions
GET    /api/v1/jobs/executions/:id
POST   /api/v1/jobs/executions        # Executar job
PUT    /api/v1/jobs/executions/:id    # Cancelar execução

# Notificações
GET    /api/v1/notifications
GET    /api/v1/notifications/:id
POST   /api/v1/notifications
PUT    /api/v1/notifications/:id
DELETE /api/v1/notifications/:id
POST   /api/v1/notifications/:id/test

# Lojas
GET    /api/v1/stores
GET    /api/v1/stores/:id
POST   /api/v1/stores
PUT    /api/v1/stores/:id
DELETE /api/v1/stores/:id
```

### **🎯 Versionamento:**

#### **Atual: v1**
```typescript
// Prefixo fixo no Express (index.ts do projeto)
app.use('/api/v1', routes);

// Todas as rotas automaticamente ficam /api/v1/*
```

#### **Futuro: v2 (quando necessário)**
```typescript
// Manter v1 para compatibilidade
app.use('/api/v1', routesV1);
app.use('/api/v2', routesV2);
```

## ⚠️ **Regras Críticas:**

1. **SEMPRE** registrar rotas no `routes/index.ts`
2. **SEMPRE** usar estrutura hierárquica (`/jobs/configurations`)
3. **SEMPRE** aplicar middleware de auth apropriado
4. **SEMPRE** seguir padrão: GET → POST → PUT → DELETE
5. **SEMPRE** usar plural nos recursos (`/integrations`, `/stores`)
6. **SEMPRE** testar URLs após registro

## 🔧 **Próximos Passos:**

### **Implementar Registration:**
```typescript
// Adicionar ao routes/index.ts:
import jobConfigRoutes from './jobs.config.route';
import jobExecRoutes from './jobs.exec.route';
import notificationRoutes from './notifications.route';
import storeRoutes from './stores.route';

router.use('/jobs/configurations', jobConfigRoutes);
router.use('/jobs/executions', jobExecRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stores', storeRoutes);
```

### **Verificar se Controllers Existem:**
- [ ] `JobConfigurationController`
- [ ] `JobExecutionController`
- [ ] `NotificationChannelController`
- [ ] `StoreController`

### **Testar Endpoints:**
```bash
# Após registro, testar:
GET    http://localhost:3000/api/v1/jobs/configurations
GET    http://localhost:3000/api/v1/stores
# ... etc
```
