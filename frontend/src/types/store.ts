export interface Store {
    id: number;
    name: string;
    registration: string;
    document: string;
    cnpj?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface StoreFilters {
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateStoreRequest {
    name: string;
    registration: string;
    document: string;
    cnpj?: string;
    active?: boolean;
}

export interface UpdateStoreRequest {
    name?: string;
    registration?: string;
    document?: string;
    cnpj?: string;
    active?: boolean;
}

export interface StoreProduct {
    id: number;
    store_id: number;
    code: number;
    name: string;
    price: number;
    stock_quantity: number;
    category?: string;
    brand?: string;
    description?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}
