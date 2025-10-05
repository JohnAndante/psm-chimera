import { db } from '../factory/database.factory';
import { StoreTable } from '../types/database';
import { FilterResult, PaginationResult } from '../types/query.type';
import { StoreFilters, CreateStoreData, UpdateStoreData, StoreListData } from '../types/store.types';
import { applyFilters, applySorting } from '../utils/query-builder.helper';

// Tipo local para paginação
interface PaginationOptions {
    page?: number;
    limit?: number;
}

class StoreService {

    getAllStores(filters: FilterResult, pagination: PaginationResult, sorting?: Record<string, 'asc' | 'desc'>): Promise<StoreListData> {
        const columnMapping = {
            'name': 'stores.name',
            'registration': 'stores.registration',
            'active': 'stores.active',
            'createdAt': 'stores.created_at'
        };

        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('stores')
                .select([
                    'stores.id',
                    'stores.name',
                    'stores.registration',
                    'stores.document',
                    'stores.active',
                    'stores.created_at',
                    'stores.updated_at'
                ])
                .where('stores.deleted_at', 'is', null);

            // Aplicar filtros
            query = applyFilters({
                query,
                filters,
                columnMapping,
            })


            // Aplicar ordenação (padrão: createdAt desc)
            query = applySorting(
                query,
                sorting || { createdAt: 'asc' },
                columnMapping
            );

            let countQuery = db
                .selectFrom('stores')
                .select(db.fn.count('id').as('count'))
                .where('stores.deleted_at', 'is', null);

            // Aplicar mesmos filtros na contagem
            countQuery = applyFilters({
                query: countQuery,
                filters,
                columnMapping,
            });

            // Executar ambas as queries em paralelo
            Promise.all([
                query
                    .limit(pagination.limit)
                    .offset(pagination.offset)
                    .execute(),
                countQuery.executeTakeFirst()
            ])
                .then(([data, countResult]) => {
                    const total = Number(countResult?.count || 0);

                    const mappedData = data.map(row => ({
                        id: row.id,
                        name: row.name,
                        registration: row.registration,
                        document: row.document,
                        active: row.active,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at
                    }))

                    resolve({ data: mappedData, total });
                })
                .catch(reject);
        });
    }

    getStoreById(id: number): Promise<StoreTable | null> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('stores')
                .selectAll()
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((store: any) => resolve(store || null))
                .catch(reject);
        });
    }

    getStoreProducts(storeId: number, pagination: PaginationOptions, search?: string): Promise<{
        products: any[];
        total: number;
    }> {
        return new Promise((resolve, reject) => {
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const offset = (page - 1) * limit;

            let productQuery = db
                .selectFrom('products')
                .selectAll()
                .where('store_id', '=', storeId);

            // Busca por código do produto
            if (search) {
                const code = parseInt(search);
                if (!isNaN(code)) {
                    productQuery = productQuery.where('code', '=', code);
                }
            }

            // Buscar produtos com paginação
            const productsPromise = productQuery
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset(offset)
                .execute();

            // Contar total
            let countQuery = db
                .selectFrom('products')
                .select(db.fn.count('id').as('count'))
                .where('store_id', '=', storeId);

            if (search) {
                const code = parseInt(search);
                if (!isNaN(code)) {
                    countQuery = countQuery.where('code', '=', code);
                }
            }

            const countPromise = countQuery.executeTakeFirst();

            Promise.all([productsPromise, countPromise])
                .then(([products, countResult]) => {
                    const total = Number(countResult?.count || 0);
                    resolve({ products, total });
                })
                .catch(reject);
        });
    }

    createStore(data: CreateStoreData): Promise<StoreTable> {
        return new Promise((resolve, reject) => {
            const storeData: any = {
                name: data.name,
                registration: data.registration,
                document: data.document || '',
                active: data.active !== undefined ? data.active : true,
                created_at: new Date(),
                updated_at: new Date()
            };

            db
                .insertInto('stores')
                .values(storeData)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then(resolve)
                .catch(reject);
        });
    }

    checkRegistrationExists(registration: string, excludeId?: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('stores')
                .select('id')
                .where('registration', '=', registration)
                .where('deleted_at', 'is', null);

            if (excludeId !== undefined) {
                query = query.where('id', '!=', excludeId);
            }

            query
                .executeTakeFirst()
                .then((result: any) => resolve(!!result))
                .catch(reject);
        });
    }

    updateStore(id: number, data: UpdateStoreData): Promise<StoreTable> {
        return new Promise((resolve, reject) => {
            const updateData: any = {
                updated_at: new Date()
            };

            if (data.name !== undefined) updateData.name = data.name;
            if (data.registration !== undefined) updateData.registration = data.registration;
            if (data.document !== undefined) updateData.document = data.document;
            if (data.active !== undefined) updateData.active = data.active;

            db
                .updateTable('stores')
                .set(updateData)
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then(resolve)
                .catch(reject);
        });
    }

    deleteStore(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            db
                .updateTable('stores')
                .set({
                    deleted_at: new Date(),
                    active: false,
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    validateStoreData(data: CreateStoreData | UpdateStoreData): string | null {
        if ('name' in data && data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                return 'Nome é obrigatório';
            }
            if (data.name.length > 255) {
                return 'Nome deve ter no máximo 255 caracteres';
            }
        }

        if ('registration' in data && data.registration !== undefined) {
            if (!data.registration || typeof data.registration !== 'string' || data.registration.trim().length === 0) {
                return 'Código de registro é obrigatório';
            }
            if (data.registration.length > 50) {
                return 'Código de registro deve ter no máximo 50 caracteres';
            }
        }

        if ('document' in data && data.document !== undefined) {
            if (typeof data.document !== 'string') {
                return 'Documento deve ser uma string';
            }
            if (data.document.length > 20) {
                return 'Documento deve ter no máximo 20 caracteres';
            }
        }

        if ('active' in data && data.active !== undefined) {
            if (typeof data.active !== 'boolean') {
                return 'Status ativo deve ser verdadeiro ou falso';
            }
        }

        return null;
    }
}

export const storeService = new StoreService();
