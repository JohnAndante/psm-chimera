---
applyTo: '**'
description: 'Guidelines for structuring service files in the backend project.'
---

# 🛠️ Services Structure Guidelines

## 📋 **Padrão Obrigatório para Services**

### **✅ Estrutura Base**

```typescript
import { db } from '../factory/database.factory';
import { EntityTable, EntityListData } from '../types/database';
import { applyFilters, applyPagination, applySorting } from '../utils/query-builder.helper';
import { FilterResult, PaginationResult } from '../types/query.type';

class EntityService {

    // Método com sistema de query unificado
    getAllEntities(filters: FilterResult, pagination: PaginationResult, sorting?: Record<string, 'asc' | 'desc'>): Promise<EntityListData> {
        const columnMapping = {
            'name': 'entities.name',
            'active': 'entities.active',
            'createdAt': 'entities.created_at',
            'updatedAt': 'entities.updated_at'
        };

        const searchFields = ['entities.name', 'entities.description'];

        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('entities')
                .selectAll()
                .where('entities.deletedAt', 'is', null)
                .orderBy('entities.created_at', 'desc');

            // Aplicar filtros
            query = applyFilters({
                query,
                filters,
                columnMapping: columnMapping,
                searchFields: searchFields
            });

            // Aplicar ordenação
            query = applySorting(query, sorting || { createdAt: 'desc' }, columnMapping);

            // Query de contagem
            let countQuery = db
                .selectFrom('entities')
                .select(db.fn.count('entities.id').as('total'))
                .where('entities.deletedAt', 'is', null);

            countQuery = applyFilters({
                query: countQuery,
                filters,
                columnMapping: columnMapping,
                searchFields: searchFields
            });

            // Aplicar paginação
            query = applyPagination(query, pagination);

            // Executar em paralelo
            Promise.all([
                countQuery.executeTakeFirstOrThrow(),
                query.execute()
            ])
            .then(([countResult, data]) => {
                resolve({
                    data,
                    total: Number(countResult.total)
                });
            })
            .catch(reject);
        });
    }

    findById(id: number): Promise<EntityTable | null> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.selectFrom('entities')
                .selectAll()
                .where('id', '=', id)
                .where('deletedAt', 'is', null)
                .executeTakeFirst()
                .then(entity => {
                    resolve(entity || null);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // Outros métodos seguem o mesmo padrão...
}

export const entityService = new EntityService();
```

### **🚫 NÃO FAZER:**
- ❌ **Prisma em Services** - Use APENAS Kysely
- ❌ `try/catch` em métodos principais - SEMPRE use `.then()/.catch()`
- ❌ Definir interfaces localmente - Use `/types`
- ❌ Hardcoded strings - Use constantes
- ❌ Direct database queries sem validação

### **✅ PADRÕES PERMITIDOS:**
- **async/await**: Permitido em services (especialmente integrações)
- **Promise chains**: Preferido mas não obrigatório
- **Kysely APENAS**: Todos os services devem usar Kysely via `db` factory

### **✅ FAZER:**
- ✅ **Sistema de Query Unificado**: Use `applyFilters`, `applyPagination`, `applySorting`
- ✅ **Column Mapping**: Mapeie campos da API para colunas do banco
- ✅ **Search Fields**: Configure campos para busca global
- ✅ **Validação de entrada**: Sempre validar parâmetros
- ✅ Import interfaces de `../types/`
- ✅ Use `db` factory para queries Kysely
- ✅ Singleton pattern quando apropriado
- ✅ **Promise chains**: Preferido nos novos services
- ✅ **Parallel queries**: Count + data para performance

### **📝 CRUD Patterns:**

#### **Create:**
```typescript
async create(data: Partial<EntityTable>): Promise<EntityTable> {
    return new Promise((resolve, reject) => {
        if (!data.name) {
            return reject(new Error('Nome é obrigatório'));
        }

        db.insertInto('entities')
            .values({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returningAll()
            .executeTakeFirstOrThrow()
            .then(entity => {
                resolve(entity);
            })
            .catch(error => {
                reject(error);
            });
    });
}
```

#### **Update:**
```typescript
async update(id: number, data: Partial<EntityTable>): Promise<EntityTable | null> {
    return new Promise((resolve, reject) => {
        if (!id) {
            return reject(new Error('ID é obrigatório'));
        }

        db.updateTable('entities')
            .set({
                ...data,
                updated_at: new Date()
            })
            .where('id', '=', id)
            .where('deletedAt', 'is', null)
            .returningAll()
            .executeTakeFirst()
            .then(entity => {
                resolve(entity || null);
            })
            .catch(error => {
                reject(error);
            });
    });
}
```

#### **Soft Delete:**
```typescript
async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!id) {
            return reject(new Error('ID é obrigatório'));
        }

        db.updateTable('entities')
            .set({
                deletedAt: new Date()
            })
            .where('id', '=', id)
            .execute()
            .then(() => {
                resolve(true);
            })
            .catch(error => {
                reject(error);
            });
    });
}
```

### **🔍 Validações e Checks:**
```typescript
async findByName(name: string): Promise<EntityTable | null> {
    return new Promise((resolve, reject) => {
        if (!name) {
            return reject(new Error('Nome é obrigatório'));
        }

        db.selectFrom('entities')
            .selectAll()
            .where('name', '=', name)
            .where('deletedAt', 'is', null)
            .executeTakeFirst()
            .then(entity => {
                resolve(entity || null);
            })
            .catch(error => {
                reject(error);
            });
    });
}
```

### **🔗 Joins e Relacionamentos:**
```typescript
async findWithRelations(id: number) {
    return new Promise((resolve, reject) => {
        db.selectFrom('entities')
            .leftJoin('related_table', 'entities.id', 'related_table.entity_id')
            .select([
                'entities.id',
                'entities.name',
                'related_table.related_field'
            ])
            .where('entities.id', '=', id)
            .where('entities.deletedAt', 'is', null)
            .execute()
            .then(results => {
                resolve(results);
            })
            .catch(error => {
                reject(error);
            });
    });
}
```

### **⚠️ Regras Importantes:**
1. **NUNCA usar Prisma** - Apenas `db` (Kysely)
2. **Sempre Promise-based** com `.then()/.catch()`
3. **Validar parâmetros** antes de executar queries
4. **Soft delete** sempre usando `deletedAt`
5. **Timestamps** automáticos em create/update
6. **Singleton export** do service: `export const storeService = new StoreService()`

