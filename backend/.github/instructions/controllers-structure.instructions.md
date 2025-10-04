---
applyTo: '**'
description: 'Guidelines for structuring controller files in the backend project.'
---

# 🎮 Controllers Structure Guidelines

## 📋 **Padrão Obrigatório para Controllers**

### **✅ Estrutura Base**

```typescript
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { serviceName } from '../services/service-name.service';

export class EntityController {

    // GET /api/v1/entities - Com queryMiddleware
    static getAll(req: AuthenticatedRequest, res: Response) {
        const filters = req.filters || {};
        const pagination = req.pagination || { limit: 10, offset: 0 };
        const sorting = req.sorting || { createdAt: 'desc' };

        return serviceName.getAllEntities(filters, pagination, sorting)
            .then(result => {
                const { data, total } = result;

                return res.status(200).json({
                    data,
                    pagination: {
                        limit: pagination.limit,
                        offset: pagination.offset,
                        total: total,
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao buscar entidades:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar entidades'
                });
            });
    }

    // GET /api/v1/entities/:id
    static getById(req: AuthenticatedRequest, res: Response) {
        const id = parseInt(req.params.id);

        return serviceName.getEntityById(id)
            .then(entity => {
                if (!entity) {
                    return res.status(404).json({
                        error: 'Entidade não encontrada'
                    });
                }

                res.status(200).json({
                    message: 'Entidade recuperada com sucesso',
                    entity
                });
            })
            .catch(error => {
                console.error('Erro ao buscar entidade:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar entidade'
                });
            });
    }

    // Outros métodos seguem o mesmo padrão...
}
```

### **🚫 NÃO FAZER:**
- ❌ `try/catch` nos controllers - SEMPRE use `.then()/.catch()`
- ❌ `async` nos métodos principais do controller - Use promise chains
- ❌ Definir `AuthenticatedRequest` localmente - Importe de `../utils/auth`
- ❌ Mensagens em inglês - Use português
- ❌ Response format `{ success: true, data: ... }` - Use formato direto
- ❌ Lógica de negócio no controller - Delegue para services

### **✅ FAZER:**
- ✅ **OBRIGATÓRIO**: `.then()/.catch()` pattern para todas as operações
- ✅ **OBRIGATÓRIO**: Promise chains ao invés de async/await nos controllers
- ✅ Import `AuthenticatedRequest` de `../utils/auth`
- ✅ **QueryMiddleware**: Use `req.filters`, `req.pagination`, `req.sorting` quando disponíveis
- ✅ **Response Format**: Use `{ data, pagination: { limit, offset, total } }` para listagens
- ✅ **Error Handling**: Console.error + status apropriado + mensagem em português
- ✅ Mensagens em português
- ✅ Response format `{ message: '...', entities/entity: ... }`
- ✅ `console.error` para logs de erro
- ✅ Status codes apropriados (200, 201, 400, 401, 404, 409, 500)

### **📝 Response Patterns:**

#### **Success Responses:**
```typescript
// Lista/Get
res.status(200).json({
    message: 'Entidades recuperadas com sucesso',
    entities: data
});

// Create
res.status(201).json({
    message: 'Entidade criada com sucesso',
    entity: data
});

// Update
res.status(200).json({
    message: 'Entidade atualizada com sucesso',
    entity: data
});

// Delete
res.status(200).json({
    message: 'Entidade removida com sucesso'
});
```

#### **Error Responses:**
```typescript
// Validation Error
res.status(400).json({
    error: 'Campo obrigatório não informado'
});

// Not Found
res.status(404).json({
    error: 'Entidade não encontrada'
});

// Conflict
res.status(409).json({
    error: 'Já existe uma entidade com este nome'
});

// Server Error
res.status(500).json({
    error: 'Erro interno do servidor'
});
```


### **✅ Controllers Simplificados (COM Validators):**
```typescript
static create(req: AuthenticatedRequest, res: Response) {
    // Dados já validados pelo validator middleware!
    const { name, type } = req.body;

    EntityService.create({ name, type })
        .then(entity => {
            res.status(201).json({
                message: 'Entidade criada com sucesso',
                data: entity
            });
        })
        .catch(error => {
            console.error('Erro ao criar entidade:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        });
}

static getById(req: AuthenticatedRequest, res: Response) {
    // ID já validado pelo validator middleware!
    const { id } = req.params;
    const entityId = parseInt(id);

    EntityService.getById(entityId)
        .then(entity => {
            if (!entity) {
                return res.status(404).json({
                    error: 'Entidade não encontrada'
                });
            }

            res.json({
                message: 'Entidade encontrada com sucesso',
                data: entity
            });
        })
        .catch(error => {
            console.error('Erro ao buscar entidade:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        });
}
```

### **🔒 Autenticação e Autorização:**
```typescript
// Verificar usuário autenticado
if (!req.user) {
    return res.status(401).json({
        error: 'Usuário não autenticado'
    });
}

// Para métodos que requerem admin, usar middleware requireAdmin na rota
```
