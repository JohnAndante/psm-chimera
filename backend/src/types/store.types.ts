import { StoreTable } from "./database";

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
