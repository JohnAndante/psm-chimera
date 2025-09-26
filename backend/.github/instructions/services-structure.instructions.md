---
applyTo: '**'
description: 'Guidelines for structuring service files in the backend project.'
---

# 🛠️ Services Structure Guidelines

## 📋 **Padrão Obrigatório para Services**

### **✅ Estrutura Base**

```typescript
import { db } from '../factory/database.factory.js';
import { EntityTable } from '../types/database.js';

class EntityService {

    async findAll(): Promise<EntityTable[]> {
        return new Promise((resolve, reject) => {
            db.selectFrom('entities')
                .selectAll()
                .where('deletedAt', 'is', null)
                .orderBy('created_at', 'desc')
                .execute()
                .then(entities => {
                    resolve(entities);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async findById(id: number): Promise<EntityTable | null> {
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
- ❌ Usar Prisma diretamente - Use `db` (Kysely)
- ❌ `try/catch` - Use `.then()/.catch()`
- ❌ `async/await` nas funções principais
- ❌ Mensagens de erro em inglês

### **✅ FAZER:**
- ✅ **SEMPRE** usar `db` (Kysely) de `../factory/database.factory`
- ✅ Retornar `Promise` com `.then()/.catch()`
- ✅ Validação de parâmetros obrigatórios
- ✅ Mensagens de erro em português
- ✅ Export como singleton: `export const entityService = new EntityService()`
- ✅ Tipos importados de `../types/database`

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

