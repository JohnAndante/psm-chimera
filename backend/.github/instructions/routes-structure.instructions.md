---
applyTo: '**'
description: 'Guidelines for structuring route files in the backend project.'
---

# 🛣️ Routes Structure Guidelines

## 📋 **Padrão Obrigatório para Routes**

### **✅ Estrutura Base**

```typescript
import { Router } from ### **⚠️ Regras Importantes:**
1. **Middlewares na ordem**: auth → admin → controller
2. **Export default** sempre
3. **Comentários mínimos** - código auto-explicativo
4. **Ordem das rotas**: GET → POST → PUT → DELETEss';
import { EntityController } from '../controllers/entity.controller.js';
import { authenticateToken, requireAdmin } from '../utils/auth.js';

const router = Router();

// Middleware de autenticação global (se necessário)
router.use(authenticateToken);

// GET /api/v1/entities
router.get('/', EntityController.getAll);

// GET /api/v1/entities/:id
router.get('/:id', EntityController.getById);

// POST /api/v1/entities (requer admin)
router.post('/', requireAdmin, EntityController.create);

// PUT /api/v1/entities/:id (requer admin)
router.put('/:id', requireAdmin, EntityController.update);

// DELETE /api/v1/entities/:id (requer admin)
router.delete('/:id', requireAdmin, EntityController.delete);

export default router;
```

### **🚫 NÃO FAZER:**
- ❌ Middleware inline desnecessário
- ❌ Rotas sem autenticação quando necessário
- ❌ Comentários desnecessários

### **✅ FAZER:**
- ✅ Controllers como métodos estáticos
- ✅ Middleware de autenticação apropriado
- ✅ Rotas organizadas por ordem: GET, POST, PUT, DELETE
- ✅ Export default do router

### **🔒 Middleware de Autenticação:**

#### **Para todas as rotas:**
```typescript
// Aplicar autenticação para todas as rotas
router.use(authenticateToken);
```

#### **Para rotas específicas:**
```typescript
// Rota sem autenticação (ex: login)
router.post('/login', EntityController.login);

// Rota com autenticação
router.get('/me', authenticateToken, EntityController.me);

// Rota que requer admin
router.post('/', authenticateToken, requireAdmin, EntityController.create);
```

### **📝 Padrões por Tipo de Rota:**

#### **CRUD Completo:**
```typescript
// Lista (GET /entities)
router.get('/', EntityController.getAll);

// Detalhe (GET /entities/:id)
router.get('/:id', EntityController.getById);

// Criar (POST /entities)
router.post('/', requireAdmin, EntityController.create);

// Atualizar (PUT /entities/:id)
router.put('/:id', requireAdmin, EntityController.update);

// Remover (DELETE /entities/:id)
router.delete('/:id', requireAdmin, EntityController.delete);
```

#### **Rotas de Ação Específica:**
```typescript
// Teste de conexão
router.post('/:id/test', EntityController.testConnection);

// Ativar/Desativar
router.patch('/:id/toggle', requireAdmin, EntityController.toggle);

// Executar ação
router.post('/:id/execute', EntityController.execute);
```

### **🎯 Organização por Funcionalidade:**

#### **Auth Routes (`/auth`):**
```typescript
// Público
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Privado
router.get('/me', authenticateToken, AuthController.me);
router.post('/change-password', authenticateToken, AuthController.changePassword);
```

#### **Admin Routes:**
```typescript
// Apenas admin pode criar/editar/remover
router.post('/', requireAdmin, EntityController.create);
router.put('/:id', requireAdmin, EntityController.update);
router.delete('/:id', requireAdmin, EntityController.delete);

// Usuários autenticados podem listar/visualizar
router.get('/', EntityController.getAll);
router.get('/:id', EntityController.getById);
```

### **📋 Naming Convention:**

#### **Arquivos:**
- `entity.route.ts` (singular)
- `entities.route.ts` (plural, se preferir)

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

### **⚠️ Regras Importantes:**
1. **Sempre usar `.js` extension** nos imports
2. **Middlewares na ordem**: auth → admin → controller
3. **Export default** sempre
4. **Comentários mínimos** - código auto-explicativo
5. **Ordem das rotas**: GET → POST → PUT → DELETE
