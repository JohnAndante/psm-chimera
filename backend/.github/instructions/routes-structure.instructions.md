---
applyTo: '**'
description: 'Guidelines for structuring route files in the backend project.'
---

# 🛣️ Routes Structure Guidelines

## 📋 **Padrão Obrigatório para Routes**

### **✅ Estrutura Base**

```typescript
import { Router } from 'express';
import { EntityController } from '../controllers/entity.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { EntityValidator } from '../validators/entity.validator';

const router = Router();

// Middleware de autenticação global (se necessário)
router.use(authenticateToken);

// GET /api/v1/entities
router.get('/',
    EntityValidator.getAll,
    EntityController.getAll
);

// GET /api/v1/entities/:id
router.get('/:id',
    EntityValidator.getById,
    EntityController.getById
);

// POST /api/v1/entities (requer admin)
router.post('/',
    requireAdmin,
    EntityValidator.create,
    EntityController.create
);

// PUT /api/v1/entities/:id (requer admin)
router.put('/:id',
    requireAdmin,
    EntityValidator.update,
    EntityController.update
);

// DELETE /api/v1/entities/:id (requer admin)
router.delete('/:id',
    requireAdmin,
    EntityValidator.delete,
    EntityController.delete
);

export default router;
```

### **🚫 NÃO FAZER:**
- ❌ Middleware inline desnecessário
- ❌ Rotas sem validação quando necessário
- ❌ Comentários desnecessários
- ❌ Validação dentro do controller

### **✅ FAZER:**
- ✅ Controllers como métodos estáticos
- ✅ Middleware de autenticação apropriado
- ✅ **Validação SEMPRE antes do controller**
- ✅ Rotas organizadas por ordem: GET, POST, PUT, DELETE
- ✅ Export default do router

### **🔒 Ordem dos Middlewares:**

#### **Ordem OBRIGATÓRIA:**
```typescript
router.post('/',
    authenticateToken,    // 1. Autenticação
    requireAdmin,         // 2. Autorização
    EntityValidator.create, // 3. Validação
    EntityController.create // 4. Controller
);
```

#### **Para rotas específicas:**
```typescript
// Rota sem autenticação (ex: login)
router.post('/login',
    AuthValidator.login,
    AuthController.login
);

// Rota com autenticação apenas
router.get('/me',
    authenticateToken,
    UserValidator.getMe,
    UserController.me
);

// Rota que requer admin
router.post('/',
    authenticateToken,
    requireAdmin,
    EntityValidator.create,
    EntityController.create
);
```

### **📝 Padrões por Tipo de Rota:**

#### **CRUD Completo:**
```typescript
// Lista (GET /entities)
router.get('/',
    EntityValidator.getAll,
    EntityController.getAll
);

// Detalhe (GET /entities/:id)
router.get('/:id',
    EntityValidator.getById,
    EntityController.getById
);

// Criar (POST /entities)
router.post('/',
    requireAdmin,
    EntityValidator.create,
    EntityController.create
);

// Atualizar (PUT /entities/:id)
router.put('/:id',
    requireAdmin,
    EntityValidator.update,
    EntityController.update
);

// Remover (DELETE /entities/:id)
router.delete('/:id',
    requireAdmin,
    EntityValidator.delete,
    EntityController.delete
);
```

#### **Rotas de Ação Específica:**
```typescript
// Teste de conexão
router.post('/:id/test',
    EntityValidator.testConnection,
    EntityController.testConnection
);

// Sincronização
router.post('/:id/sync',
    EntityValidator.sync,
    EntityController.sync
);

// Listar recursos relacionados
router.get('/:id/products',
    EntityValidator.getProducts,
    EntityController.getProducts
);
```

### **🎯 Organização por Funcionalidade:**

#### **Auth Routes (`/auth`):**
```typescript
// Público
router.post('/login',
    AuthValidator.login,
    AuthController.login
);

router.post('/logout',
    AuthValidator.logout,
    AuthController.logout
);

// Privado
router.get('/me',
    authenticateToken,
    AuthController.me
);

router.post('/change-password',
    authenticateToken,
    AuthValidator.changePassword,
    AuthController.changePassword
);
```

#### **Admin Routes:**
```typescript
// Apenas admin pode criar/editar/remover
router.post('/',
    requireAdmin,
    EntityValidator.create,
    EntityController.create
);

router.put('/:id',
    requireAdmin,
    EntityValidator.update,
    EntityController.update
);

router.delete('/:id',
    requireAdmin,
    EntityValidator.delete,
    EntityController.delete
);

// Usuários autenticados podem listar/visualizar
router.get('/',
    EntityValidator.getAll,
    EntityController.getAll
);

router.get('/:id',
    EntityValidator.getById,
    EntityController.getById
);
```

### **📋 Naming Convention:**

#### **Arquivos:**
- `entity.route.ts` (singular)
- Sempre terminados em `.route.ts`

#### **URLs:**
- `/entities` (plural)
- `/entities/:id`
- `/entities/:id/action`

#### **Controller Methods:**
- `getAll` - Lista
- `getById` - Detalhe
- `create` - Criar
- `update` - Atualizar
- `delete` - Remover

#### **Validator Methods:**
- Mesmos nomes dos controllers
- `EntityValidator.getAll`
- `EntityValidator.create`
- etc.

### **⚠️ Regras Importantes:**
1. **Middlewares na ordem**: auth → admin → validation → controller
2. **SEMPRE usar validação** antes do controller
3. **Export default** sempre
4. **Comentários mínimos** - código auto-explicativo
5. **Ordem das rotas**: GET → POST → PUT → DELETE
6. **Importar validators** correspondentes
7. **Quebrar linhas** para melhor legibilidade

### **🔍 Exemplo Completo Stores:**

```typescript
import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authenticateToken, requireAdmin } from '../utils/auth';
import { StoreValidator } from '../validators/store.validator';

const router = Router();

router.use(authenticateToken);

router.get('/',
    StoreValidator.getAll,
    StoreController.getAll
);

router.get('/:id',
    StoreValidator.getById,
    StoreController.getById
);

router.get('/:id/products',
    StoreValidator.getProducts,
    StoreController.getProducts
);

router.post('/',
    requireAdmin,
    StoreValidator.create,
    StoreController.create
);

router.put('/:id',
    requireAdmin,
    StoreValidator.update,
    StoreController.update
);

router.delete('/:id',
    requireAdmin,
    StoreValidator.delete,
    StoreController.delete
);

router.post('/:id/sync',
    StoreValidator.sync,
    StoreController.sync
);

export default router;
```

Esta estrutura garante **validação automática**, **código limpo** e **manutenibilidade**!
