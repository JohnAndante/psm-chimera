import { createApiInstance } from './base-api';
import type {
    Store,
    StoreFilters,
    CreateStoreRequest,
    UpdateStoreRequest,
    StoreProduct
} from '../types/store';

// Instância da API para stores
const api = createApiInstance();

export class StoreController {
    static async getAllStores(filters?: StoreFilters): Promise<Store[]> {
        const params = new URLSearchParams();

        if (filters?.active !== undefined) {
            params.append('active', filters.active.toString());
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        if (filters?.page) {
            params.append('page', filters.page.toString());
        }
        if (filters?.limit) {
            params.append('limit', filters.limit.toString());
        }

        const queryString = params.toString();
        const response = await api.get<{ data: Store[] }>(`v1/stores${queryString ? `?${queryString}` : ''}`);
        return response.data.data;
    }

    static async getStoreById(id: number): Promise<Store> {
        const response = await api.get<{ data: Store }>(`v1/stores/${id}`);
        return response.data.data;
    }

    static async createStore(store: CreateStoreRequest): Promise<Store> {
        const response = await api.post<{ data: Store }>('v1/stores', store);
        return response.data.data;
    }

    static async updateStore(id: number, store: UpdateStoreRequest): Promise<Store> {
        const response = await api.put<{ data: Store }>(`v1/stores/${id}`, store);
        return response.data.data;
    }

    static async deleteStore(id: number): Promise<void> {
        await api.delete(`v1/stores/${id}`);
    }

    static async getStoreProducts(
        id: number,
        search?: string,
        page?: number,
        limit?: number
    ): Promise<{ products: StoreProduct[]; total: number }> {
        const params = new URLSearchParams();

        if (search) {
            params.append('search', search);
        }
        if (page) {
            params.append('page', page.toString());
        }
        if (limit) {
            params.append('limit', limit.toString());
        }

        const queryString = params.toString();
        const response = await api.get<{
            data: { products: StoreProduct[]; total: number }
        }>(`v1/stores/${id}/products${queryString ? `?${queryString}` : ''}`);
        return response.data.data;
    }

    static async syncStoreProducts(
        id: number,
        notificationChannelId?: number,
        forceSync = false
    ): Promise<{ message: string; data: any }> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const response = await api.post<{ message: string; data: any }>(`v1/stores/${id}/sync`, {  // eslint-disable-line @typescript-eslint/no-explicit-any
            notification_channel_id: notificationChannelId,
            force_sync: forceSync
        });
        return response.data;
    }
}
