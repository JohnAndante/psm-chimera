import { db } from '../factory/database.factory';
import { StoreTable } from '../types/database';

export interface CreateStoreData {
    name: string;
    registration: string;
    document?: string;
    active?: boolean;
}

export interface UpdateStoreData {
    name?: string;
    registration?: string;
    document?: string;
    active?: boolean;
}

export interface StoreFilters {
    active?: boolean;
    search?: string;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface StoreWithProducts extends StoreTable {
    products?: any[];
    product_count?: number;
}

export class StoreService {

    static getAllStores(filters: StoreFilters = {}): Promise<StoreTable[]> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('stores')
                .selectAll()
                .where('deleted_at', 'is', null);

            // Filtro por status ativo
            if (filters.active !== undefined) {
                query = query.where('active', '=', filters.active);
            }

            // Busca por nome, registration ou document
            if (filters.search) {
                const searchTerm = `%${filters.search}%`;
                query = query.where((eb: any) =>
                    eb.or([
                        eb('name', 'ilike', searchTerm),
                        eb('registration', 'ilike', searchTerm),
                        eb('document', 'ilike', searchTerm)
                    ])
                );
            }

            query
                .orderBy('name', 'asc')
                .execute()
                .then(resolve)
                .catch(reject);
        });
    }

    static getStoreById(id: number): Promise<StoreTable | null> {
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

    static getStoreProducts(storeId: number, pagination: PaginationOptions, search?: string): Promise<{
        products: any[];
        total: number;
    }> {
        return new Promise((resolve, reject) => {
            const offset = (pagination.page - 1) * pagination.limit;

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
                .limit(pagination.limit)
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

    static createStore(data: CreateStoreData): Promise<StoreTable> {
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

    static checkRegistrationExists(registration: string, excludeId?: number): Promise<boolean> {
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

    static updateStore(id: number, data: UpdateStoreData): Promise<StoreTable> {
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

    static deleteStore(id: number): Promise<void> {
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

    static validateStoreData(data: CreateStoreData | UpdateStoreData): string | null {
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
