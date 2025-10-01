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