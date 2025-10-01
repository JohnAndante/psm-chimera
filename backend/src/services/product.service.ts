import { db } from '../factory/database.factory.js';

export interface ProductData {
    id?: string;
    code: number;
    price: number;
    final_price: number;
    limit: number;
    store_id: number;
    starts_at?: string | null;
    expires_at?: string | null;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

export interface CreateProductData {
    code: number;
    price: number;
    final_price: number;
    limit: number;
    store_id: number;
    starts_at?: string;
    expires_at?: string;
}

export interface UpdateProductData {
    code?: number;
    price?: number;
    final_price?: number;
    limit?: number;
    starts_at?: string;
    expires_at?: string;
}

export interface ProductFilters {
    store_id?: number;
    code?: number;
    price_min?: number;
    price_max?: number;
    active_only?: boolean;
}

export class ProductService {

    /**
     * Busca todos os produtos
     */
    static async getAllProducts(): Promise<ProductData[]> {
        return new Promise((resolve, reject) => {
            db.selectFrom('products')
                .selectAll()
                .where('deleted_at', 'is', null)
                .orderBy('created_at', 'desc')
                .execute()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Busca produto por ID
     */
    static async getProductById(id: string): Promise<ProductData | null> {
        return new Promise((resolve, reject) => {
            db.selectFrom('products')
                .selectAll()
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((product: any) => resolve(product || null))
                .catch(reject);
        });
    }

    /**
     * Busca produtos por loja
     */
    static async getByStoreId(storeId: number, filters: ProductFilters = {}): Promise<ProductData[]> {
        return new Promise((resolve, reject) => {
            let query = db.selectFrom('products')
                .select([
                    'id',
                    'code',
                    'price',
                    'final_price',
                    'limit',
                    'store_id',
                    'starts_at',
                    'expires_at',
                    'created_at',
                    'updated_at'
                ])
                .where('store_id', '=', storeId)
                .where('deleted_at', 'is', null);

            if (filters.code !== undefined) {
                query = query.where('code', '=', filters.code);
            }

            if (filters.price_min !== undefined) {
                query = query.where('final_price', '>=', filters.price_min);
            }

            if (filters.price_max !== undefined) {
                query = query.where('final_price', '<=', filters.price_max);
            }

            // Filtrar apenas produtos "ativos" baseado nas datas
            if (filters.active_only) {
                const now = new Date().toISOString();
                query = query.where((eb: any) =>
                    eb.and([
                        eb.or([
                            eb('starts_at', 'is', null),
                            eb('starts_at', '<=', now)
                        ]),
                        eb.or([
                            eb('expires_at', 'is', null),
                            eb('expires_at', '>=', now)
                        ])
                    ])
                );
            }

            query.orderBy('code', 'asc')
                .execute()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Cria um produto
     */
    static async createProduct(data: CreateProductData): Promise<ProductData> {
        return new Promise((resolve, reject) => {
            const productData = {
                code: data.code,
                price: data.price,
                final_price: data.final_price,
                limit: data.limit,
                store_id: data.store_id,
                starts_at: data.starts_at || null,
                expires_at: data.expires_at || null,
                created_at: new Date(),
                updated_at: new Date()
            };

            db.insertInto('products')
                .values(productData as any)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Cria múltiplos produtos (batch)
     */
    static async createProducts(data: CreateProductData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (data.length === 0) {
                resolve();
                return;
            }

            const productsData = data.map(product => ({
                code: product.code,
                price: product.price,
                final_price: product.final_price,
                limit: product.limit,
                store_id: product.store_id,
                starts_at: product.starts_at || null,
                expires_at: product.expires_at || null,
                created_at: new Date(),
                updated_at: new Date()
            }));

            db.insertInto('products')
                .values(productsData as any)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Atualiza produto
     */
    static async updateProduct(id: string, data: UpdateProductData): Promise<ProductData> {
        return new Promise((resolve, reject) => {
            const updateData: any = {
                updated_at: new Date()
            };

            if (data.code !== undefined) updateData.code = data.code;
            if (data.price !== undefined) updateData.price = data.price;
            if (data.final_price !== undefined) updateData.final_price = data.final_price;
            if (data.limit !== undefined) updateData.limit = data.limit;
            if (data.starts_at !== undefined) updateData.starts_at = data.starts_at;
            if (data.expires_at !== undefined) updateData.expires_at = data.expires_at;

            db.updateTable('products')
                .set(updateData)
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Deleta produto (soft delete)
     */
    static async deleteProduct(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.updateTable('products')
                .set({
                    deleted_at: new Date(),
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Deleta todos os produtos de uma loja (para re-sync)
     */
    static async deleteAllByStore(storeId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            db.updateTable('products')
                .set({
                    deleted_at: new Date(),
                    updated_at: new Date()
                })
                .where('store_id', '=', storeId)
                .where('deleted_at', 'is', null)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Deleta todos os produtos (hard delete - cuidado!)
     */
    static async deleteAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            db.deleteFrom('products')
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Conta produtos por loja
     */
    static async countByStore(storeId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            db.selectFrom('products')
                .select((eb: any) => eb.fn.count('id').as('count'))
                .where('store_id', '=', storeId)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((result: any) => resolve(Number(result?.count || 0)))
                .catch(reject);
        });
    }

    /**
     * Busca produtos por códigos específicos
     */
    static async getProductsByCodes(storeId: number, codes: number[]): Promise<ProductData[]> {
        return new Promise((resolve, reject) => {
            if (codes.length === 0) {
                resolve([]);
                return;
            }

            db.selectFrom('products')
                .selectAll()
                .where('store_id', '=', storeId)
                .where('code', 'in', codes)
                .where('deleted_at', 'is', null)
                .orderBy('code', 'asc')
                .execute()
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * Upsert de produtos (insert ou update se já existe)
     */
    static async upsertProducts(storeId: number, products: CreateProductData[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`[PRODUCTS] Upsert de ${products.length} produtos para loja ${storeId}`);

                // Primeiro, deletar produtos existentes da loja (soft delete)
                await this.deleteAllByStore(storeId);

                // Inserir novos produtos
                if (products.length > 0) {
                    await this.createProducts(products);
                }

                console.log(`[PRODUCTS] Upsert concluído para loja ${storeId}`);
                resolve();
            } catch (error) {
                console.error(`[PRODUCTS] Erro no upsert para loja ${storeId}:`, error);
                reject(error);
            }
        });
    }

    /**
     * Converte produtos RP para formato interno
     */
    static parseRPProducts(rpProducts: any[], storeId: number): CreateProductData[] {
        const today = new Date().toISOString().slice(0, 10);

        return rpProducts.map((product: any) => ({
            code: product.codigo || product.code,
            price: product.preco || product.price,
            final_price: product.precoVenda2 || product.final_price || product.preco || product.price,
            limit: 1000, // Limite padrão
            store_id: storeId,
            starts_at: `${today}T06:00:00.000Z`,
            expires_at: `${today}T23:59:59.000Z`
        }));
    }

    /**
     * Converte produtos internos para formato CresceVendas
     */
    static formatForCresceVendas(products: ProductData[]): any[] {
        return products.map((product: ProductData) => ({
            code: product.code,
            price: product.price,
            final_price: product.final_price,
            limit: product.limit
        }));
    }
}
