# Filter and Pagination Middlewares Documentation

## Overview

Este documento descreve a implementação de dois middlewares essenciais para padronizar listagens no backend:

1. **Filter Middleware**: Padroniza filtros de busca
2. **Pagination Middleware**: Padroniza paginação de resultados

## 1. Filter Middleware

### Propósito
Padronizar como filtros são recebidos, validados e aplicados nas consultas SQL usando Kysely.

### Estrutura de Filtros

#### Input Format (Query Parameters)
```typescript
// URL: /users?filter[name][like]=robson&filter[creation_date][gte]=2023-01-01&filter[is_active][eq]=true
{
  filter: {
    name: { like: "robson" },
    creation_date: { gte: "2023-01-01", lte: "2023-12-31" },
    is_active: { eq: true }
  }
}
```

#### Supported Operators
```typescript
type FilterOperators = {
  eq: any;           // Equals
  ne: any;           // Not equals
  gt: any;           // Greater than
  gte: any;          // Greater than or equal
  lt: any;           // Less than
  lte: any;          // Less than or equal
  like: string;      // SQL LIKE with wildcards
  ilike: string;     // Case-insensitive LIKE
  in: any[];         // IN array
  nin: any[];        // NOT IN array
  null: boolean;     // IS NULL / IS NOT NULL
  between: [any, any]; // BETWEEN two values
}
```

#### Supported Field Types
```typescript
type FilterFieldTypes =
  | 'string'    // String fields
  | 'number'    // Numeric fields
  | 'boolean'   // Boolean fields
  | 'date'      // Date fields
  | 'uuid'      // UUID fields
  | 'enum'      // Enum fields
```

### Usage in Routes

```typescript
import { filterMiddleware } from '../middlewares/filter.middleware';

// Define allowed filters for the route
app.get('/users',
  filterMiddleware({
    name: 'string',
    email: 'string',
    creation_date: 'date',
    is_active: 'boolean',
    role: 'enum',
    age: 'number'
  }),
  userController.listUsers
);
```

### Usage in Controllers

```typescript
export class UserController {
  static async listUsers(req: AuthenticatedRequest, res: Response) {
    // Filters are injected into req.filters
    const filters = req.filters; // FilterResult type

    return userService.getUsers(filters)
      .then(users => {
        return res.json({
          success: true,
          data: users,
          filters: filters // Return applied filters
        });
      });
  }
}
```

## 2. Pagination Middleware

### Propósito
Padronizar paginação de resultados com validação e defaults seguros.

### Query Parameters
```typescript
// URL: /users?page=2&limit=25
{
  page: number;  // Default: 1
  limit: number; // Default: 10, Max: 100
}
```

### Usage in Routes

```typescript
import { paginationMiddleware } from '../middlewares/pagination.middleware';

// No configuration needed - uses defaults
app.get('/users',
  paginationMiddleware(),
  userController.listUsers
);

// Or with custom limits
app.get('/users',
  paginationMiddleware({ maxLimit: 50, defaultLimit: 20 }),
  userController.listUsers
);
```

### Usage in Controllers

```typescript
export class UserController {
  static async listUsers(req: AuthenticatedRequest, res: Response) {
    // Pagination is injected into req.pagination
    const pagination = req.pagination; // PaginationResult type

    return userService.getUsers(undefined, pagination)
      .then(result => {
        return res.json({
          success: true,
          data: result.data,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            pages: Math.ceil(result.total / pagination.limit),
            offset: pagination.offset
          }
        });
      });
  }
}
```

## 3. Combined Usage

### Route Definition
```typescript
app.get('/users',
  filterMiddleware({
    name: 'string',
    email: 'string',
    creation_date: 'date',
    is_active: 'boolean'
  }),
  paginationMiddleware(),
  userController.listUsers
);
```

### Controller Implementation
```typescript
export class UserController {
  static async listUsers(req: AuthenticatedRequest, res: Response) {
    const filters = req.filters;
    const pagination = req.pagination;

    return userService.getUsers(filters, pagination)
      .then(result => {
        return res.json({
          success: true,
          data: result.data,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            pages: Math.ceil(result.total / pagination.limit),
            offset: pagination.offset
          },
          filters: filters
        });
      });
  }
}
```

## 4. Kysely Query Helper

### QueryBuilder Helper
Um helper para aplicar filtros e paginação automaticamente nas queries Kysely:

```typescript
import { QueryBuilder } from 'kysely';
import { applyFilters, applyPagination } from '../utils/query-builder.helper';

// Usage in Service
class UserService {
  async getUsers(filters?: FilterResult, pagination?: PaginationResult) {
    let query = this.db.selectFrom('users').selectAll();

    // Apply filters
    if (filters) {
      query = applyFilters(query, filters);
    }

    // Get total count before pagination
    const total = await query.select(db.fn.count('id').as('count')).executeTakeFirst();

    // Apply pagination
    if (pagination) {
      query = applyPagination(query, pagination);
    }

    const data = await query.execute();

    return {
      data,
      total: Number(total?.count || 0)
    };
  }
}
```

## 5. Type Definitions

### Request Extensions
```typescript
declare global {
  namespace Express {
    interface Request {
      filters?: FilterResult;
      pagination?: PaginationResult;
    }
  }
}

interface FilterResult {
  [field: string]: {
    [operator: string]: any;
  };
}

interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
}
```

## 6. Example URLs

```bash
# Basic pagination
GET /users?page=2&limit=25

# Basic filtering
GET /users?filter[name][like]=john&filter[is_active][eq]=true

# Combined filters and pagination
GET /users?filter[creation_date][gte]=2023-01-01&filter[role][in]=admin,user&page=2&limit=50

# Complex filters
GET /products?filter[price][between]=10,100&filter[category][in]=electronics,books&filter[name][ilike]=phone&page=1&limit=20
```

## 7. Error Handling

### Filter Validation Errors
```typescript
{
  "error": "Invalid filter",
  "details": {
    "field": "creation_date",
    "operator": "invalid_op",
    "message": "Operator 'invalid_op' not supported for field type 'date'"
  }
}
```

### Pagination Validation Errors
```typescript
{
  "error": "Invalid pagination",
  "details": {
    "field": "limit",
    "value": 150,
    "message": "Limit cannot exceed 100"
  }
}
```

## 8. Security Considerations

1. **Field Whitelist**: Apenas campos explicitamente definidos são aceitos
2. **Type Validation**: Valores são validados conforme o tipo do campo
3. **SQL Injection Prevention**: Todos os valores passam pelo Kysely (prepared statements)
4. **Limit Enforcement**: Limite máximo de registros por página
5. **Operator Restriction**: Apenas operadores pré-definidos são aceitos

## 9. Performance Considerations

1. **Index Usage**: Filtros devem usar campos indexados quando possível
2. **Pagination Limits**: Limites máximos previnem queries muito grandes
3. **Count Optimization**: Count é executado antes da paginação para eficiência
4. **Query Caching**: Possibilidade de cache para queries comuns

## 10. Migration Path

Para implementar gradualmente:

1. Criar middlewares e helpers
2. Aplicar em rotas novas primeiro
3. Migrar rotas existentes uma por vez
4. Remover implementações antigas de filtro/paginação
5. Documentar exemplos de uso por domínio

---

Esta documentação serve como base para a implementação dos middlewares seguindo os padrões arquiteturais estabelecidos no projeto.
