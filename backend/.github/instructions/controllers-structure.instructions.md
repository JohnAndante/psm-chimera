---
applyTo: '**'
description: 'Guidelines for structuring controller files in the backend project.'
---

# 🎮 Controllers Structure Guidelines

## 📋 **Padrão Obrigatório para Controllers**

### **✅ Estrutura Base**

```typescript
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth.js';
import { serviceName } from '../services/service-name.service.js';

export class EntityController {

    // GET /api/v1/entities
    static async getAll(req: AuthenticatedRequest, res: Response) {
        return serviceName.findAll()
            .then(entities => {
                res.status(200).json({
                    message: 'Entidades recuperadas com sucesso',
                    entities
                });
            })
            .catch(error => {
                console.error('Erro ao buscar entidades:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // Outros métodos seguem o mesmo padrão...
}
```

### **🚫 NÃO FAZER:**
- ❌ `try/catch` - Use `.then()/.catch()`
- ❌ Definir `AuthenticatedRequest` localmente
- ❌ Mensagens em inglês
- ❌ Response format `{ success: true, data: ... }`

### **✅ FAZER:**
- ✅ `.then()/.catch()` pattern
- ✅ Import `AuthenticatedRequest` de `../utils/auth`
- ✅ Mensagens em português
- ✅ Response format `{ message: '...', data: ... }`
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

### **🔍 Validação de Entrada:**
```typescript
// Sempre validar dados obrigatórios
if (!name || !type) {
    return res.status(400).json({
        error: 'Nome e tipo são obrigatórios'
    });
}

// Validar IDs
const entityId = parseInt(id);
if (isNaN(entityId)) {
    return res.status(400).json({
        error: 'ID inválido'
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
