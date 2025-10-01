# Middlewares de Filtro e Paginação - Exemplos de Uso

Este documento mostra como usar os middlewares de filtro e paginação implementados.

## Configuração Básica

### 1. Importações Necessárias

```typescript
import { filterMiddleware } from '../middlewares/filter.middleware';
import { paginationMiddleware } from '../middlewares/pagination.middleware';
import { applyFilters, applyPagination, createPaginatedResponse } from '../utils/query-builder.helper';
```

### 2. Definindo Filtros na Rota

```typescript
// Configuração de filtros
const storeFiltersConfig = {
    name: 'string' as const,
    active: 'boolean' as const,
    integration_type: {
        type: 'enum' as const,
        enumValues: ['crescevendas', 'rp']
    },
    created_at: 'date' as const,
    updated_at: 'date' as const,
    price: {
        type: 'number' as const,
        operators: ['eq', 'gt', 'gte', 'lt', 'lte', 'between']
    }
};

// Configuração de paginação
const paginationConfig = {
    defaultLimit: 10,
    maxLimit: 100,
    allowUnlimited: false
};

// Aplicando os middlewares
router.get('/',
    filterMiddleware(storeFiltersConfig),
    paginationMiddleware(paginationConfig),
    Controller.getAll
);
```

## Exemplos de Requests

### 1. Filtros Básicos

```bash
# Filtro de igualdade
GET /api/v1/stores?filter[active][eq]=true

# Filtro de texto (LIKE)
GET /api/v1/stores?filter[name][like]=%loja%

# Filtro de data
GET /api/v1/stores?filter[created_at][gte]=2024-01-01

# Filtro de enum
GET /api/v1/stores?filter[integration_type][eq]=crescevendas
```

### 2. Filtros Avançados

```bash
# Filtro IN (múltiplos valores)
GET /api/v1/stores?filter[integration_type][in][]=crescevendas&filter[integration_type][in][]=rp

# Filtro BETWEEN (intervalo)
GET /api/v1/stores?filter[price][between][]=100&filter[price][between][]=500

# Filtro NOT IN
GET /api/v1/stores?filter[status][nin][]=inactive&filter[status][nin][]=deleted

# Filtro NULL/NOT NULL
GET /api/v1/stores?filter[deleted_at][null]=true
```

### 3. Paginação

```bash
# Paginação por página
GET /api/v1/stores?page=2&limit=20

# Paginação por offset
GET /api/v1/stores?offset=40&limit=20

# Usando apenas limit (primeira página)
GET /api/v1/stores?limit=50
```

### 4. Combinando Filtros e Paginação

```bash
GET /api/v1/stores?filter[active][eq]=true&filter[name][like]=%super%&page=1&limit=10
```

## Implementação no Controller

### Controller Básico

```typescript
export class StoreController {
    static getAll(req: AuthenticatedRequest, res: Response) {
        const db = DatabaseFactory.getInstance();

        // Middlewares já processaram filtros e paginação
        const filters = req.filters || {};
        const pagination = req.pagination!;

        // Query base
        let query = db.selectFrom('stores').selectAll();

        // Aplica filtros
        query = applyFilters(query, filters);

        // Count query para total
        let countQuery = db.selectFrom('stores').select(db.fn.count('id').as('total'));
        countQuery = applyFilters(countQuery, filters);

        // Executa ambas as queries
        Promise.all([
            countQuery.executeTakeFirstOrThrow(),
            applyPagination(query, pagination).execute()
        ])
            .then(([countResult, data]) => {
                const totalCount = Number(countResult.total);
                const paginationInfo = req.calculatePaginationInfo!(totalCount);

                const response = createPaginatedResponse(
                    data,
                    pagination,
                    totalCount,
                    paginationInfo
                );

                res.json(response);
            })
            .catch((error) => {
                console.error('Erro:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            });
    }
}
```

## Tipos de Campo Suportados

### String

```typescript
name: 'string' // Operadores: eq, ne, like, ilike, in, nin, null
```

### Number

```typescript
price: 'number' // Operadores: eq, ne, gt, gte, lt, lte, in, nin, between, null
```

### Boolean

```typescript
active: 'boolean' // Operadores: eq, ne, null
```

### Date

```typescript
created_at: 'date' // Operadores: eq, ne, gt, gte, lt, lte, between, null
```

### UUID

```typescript
user_id: 'uuid' // Operadores: eq, ne, in, nin, null
```

### Enum

```typescript
status: {
    type: 'enum',
    enumValues: ['active', 'inactive', 'pending']
} // Operadores: eq, ne, in, nin, null
```

### Campo Customizado

```typescript
priority: {
    type: 'number',
    operators: ['eq', 'gt', 'gte'] // Apenas estes operadores
}
```

## Resposta Padrão

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Loja 1",
      "active": true
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "page": 1,
    "totalCount": 25,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "totalPages": 3,
    "currentPage": 1
  }
}
```

## Tratamento de Erros

### Erro de Validação de Filtro

```json
{
  "success": false,
  "error": "Invalid filter",
  "details": {
    "field": "price",
    "operator": "eq",
    "value": "invalid",
    "message": "Value must be a valid number for field 'price'"
  }
}
```

### Erro de Validação de Paginação

```json
{
  "success": false,
  "error": "Invalid pagination",
  "details": {
    "field": "limit",
    "value": 1000,
    "message": "Limit cannot exceed 100"
  }
}
```

## Boas Práticas

### 1. Sempre definir maxLimit

```typescript
const paginationConfig = {
    defaultLimit: 10,
    maxLimit: 100, // Previne sobrecarga do servidor
    allowUnlimited: false
};
```

### 2. Restringir operadores por campo quando necessário

```typescript
const filterConfig = {
    sensitive_data: {
        type: 'string',
        operators: ['eq'] // Apenas igualdade exata
    }
};
```

### 3. Usar índices no banco para campos filtráveis

```sql
-- Exemplo para PostgreSQL
CREATE INDEX idx_stores_active ON stores(active);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_created_at ON stores(created_at);
```

### 4. Validar permissões antes dos middlewares

```typescript
router.get('/',
    authenticateToken,           // Primeiro: autenticação
    filterMiddleware(config),    // Segundo: filtros
    paginationMiddleware(config),// Terceiro: paginação
    Controller.getAll           // Último: controller
);
```
