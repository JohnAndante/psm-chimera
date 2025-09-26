---
applyTo: '**'
description: 'Joi validation guidelines and best practices for PSM Chimera v2 backend.'
---

# Joi Validation Instructions

## Estrutura de Validação

O projeto utiliza **Joi** para validação de entrada de dados com uma arquitetura organizada em duas camadas:

### 📁 **Estrutura de Pastas:**

```
src/
├── validators/          # Validação de entrada (request)
│   ├── auth.validator.ts
│   ├── store.validator.ts
│   └── integration.validator.ts
└── utils/
    └── validation.ts   # Middleware e utilitários de validação
```

## 🔧 **Validators (Entrada de Request)**

### **Responsabilidade:**
- Validar `params`, `query` e `body` das requisições HTTP
- Retornar erros padronizados para o cliente
- Middleware que roda ANTES dos controllers

### **Padrão de Implementação:**

```typescript
import Joi from 'joi';
import { validateRequest } from '../utils/validation';

// Schemas específicos para cada endpoint
const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.positive': 'ID deve ser um número positivo',
        'any.required': 'ID é obrigatório'
    })
});

const createBodySchema = Joi.object({
    name: Joi.string().min(1).max(255).required().messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'string.max': 'Nome deve ter no máximo 255 caracteres',
        'any.required': 'Nome é obrigatório'
    })
});

// Export dos middlewares
export const ModuleValidator = {
    create: validateRequest({
        body: createBodySchema
    }),

    getById: validateRequest({
        params: idParamSchema
    }),

    getAll: validateRequest({
        query: getAllQuerySchema
    })
};
```

### **Mensagens de Erro:**
- **SEMPRE em português** para usuário final
- **Específicas e informativas**
- **Consistentes** com padrões do projeto

## 🛠️ **Utils/Validation (Middleware)**

### **Função validateRequest:**

```typescript
export interface ValidationSchemas {
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    body?: Joi.ObjectSchema;
}

export function validateRequest(schemas: ValidationSchemas) {
    return validate(schemas);
}
```

### **Padrão de Erro:**
- Status **400** para erros de validação
- Response: `{ error: string, details?: string[] }`
- Compatível com padrão do projeto

## 🛤️ **Integração com Routes**

### **Padrão de Uso nas Rotas:**

```typescript
import { ModuleValidator } from '../validators/module.validator';

// Ordem correta dos middlewares:
router.post('/',
    requireAdmin,           // 1. Autenticação/Autorização
    ModuleValidator.create, // 2. Validação
    ModuleController.create // 3. Controller
);

router.get('/:id',
    ModuleValidator.getById, // 1. Validação de params
    ModuleController.getById // 2. Controller
);
```

### **NUNCA fazer:**
- ❌ Validação dentro do controller
- ❌ Usar schemas Joi diretamente nas rotas
- ❌ Misturar validação de entrada com business rules

## 📋 **Schemas Comuns Reutilizáveis**

### **IDs:**
```typescript
const idSchema = Joi.number().integer().positive().required();
```

### **Paginação:**
```typescript
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(50).optional()
});
```

### **Boolean String:**
```typescript
const booleanStringSchema = Joi.string().valid('true', 'false').optional();
```

### **Search:**
```typescript
const searchSchema = Joi.string().min(1).max(255).optional();
```

## ⚠️ **Regras Importantes**

### **Mensagens:**
- **SEMPRE em português**
- **Específicas para cada campo**
- **Informativas para o usuário**

### **Validação vs Business Rules:**
- **Validators**: Formato, tipo, obrigatoriedade
- **Schemas**: Regras de negócio, consistência de dados

### **Performance:**
- **Validação ANTES** de acessar banco de dados
- **Falha rápida** em dados inválidos
- **Middleware eficiente**

### **Consistência:**
- **Mesmo padrão** para todos os módulos
- **Estrutura uniforme** de arquivos
- **Nomenclatura padronizada**

## 🎯 **Exemplo Completo Store**

### **Validator:**
```typescript
export const StoreValidator = {
    getAll: validateRequest({ query: getAllQuerySchema }),
    getById: validateRequest({ params: idParamSchema }),
    create: validateRequest({ body: createStoreBodySchema }),
    update: validateRequest({ params: idParamSchema, body: updateStoreBodySchema })
};
```

### **Route:**
```typescript
router.post('/', requireAdmin, StoreValidator.create, StoreController.create);
router.get('/:id', StoreValidator.getById, StoreController.getById);
```

### **Controller (Simplificado):**
```typescript
static create(req: AuthenticatedRequest, res: Response) {
    const { name, registration } = req.body; // Já validado!

    StoreService.createStore({ name, registration })
        .then((store) => {
            res.status(201).json({
                message: 'Loja criada com sucesso',
                data: store
            });
        })
        .catch(handleError);
}
```

Esta estrutura garante **separação de responsabilidades**, **código limpo** e **validação robusta**!
