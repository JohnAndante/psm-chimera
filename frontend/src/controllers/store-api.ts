import { createApiInstance } from './base-api';
import type {
    Store,
    StoreFilters,
    CreateStoreRequest,
    UpdateStoreRequest,
    StoreProduct,
} from '../types/store';
import type { AxiosInstance } from 'axios';
import { buildApiUrl } from '@/utils/build-api-url';
import type { ApiResponse } from '@/types';


class StoreApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    list(filters?: StoreFilters) {
        return new Promise<ApiResponse<Store[]>>((resolve, reject) => {
            const url = buildApiUrl('v1/stores', filters);

            this.axiosInstance.get(url)
                .then(response => {
                    const { metadata, data } = response.data;
                    resolve({ metadata, data });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    getStoreById(id: number): Promise<Store> {
        return new Promise<Store>((resolve, reject) => {
            this.axiosInstance.get(`v1/stores/${id}`)
                .then(response => {
                    resolve(response.data.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    createStore(store: CreateStoreRequest): Promise<Store> {
        return new Promise<Store>((resolve, reject) => {
            this.axiosInstance.post('v1/stores', store)
                .then(response => {
                    resolve(response.data.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    updateStore(id: number, store: UpdateStoreRequest): Promise<Store> {
        return new Promise<Store>((resolve, reject) => {
            this.axiosInstance.put(`v1/stores/${id}`, store)
                .then(response => {
                    resolve(response.data.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    deleteStore(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.delete(`v1/stores/${id}`)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    getStoreProducts(
        id: number,
        search?: string,
        page?: number,
        limit?: number
    ): Promise<{ products: StoreProduct[]; total: number }> {
        return new Promise<{ products: StoreProduct[]; total: number }>((resolve, reject) => {
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
            this.axiosInstance.get<{
                data: { products: StoreProduct[]; total: number }
            }>(`v1/stores/${id}/products${queryString ? `?${queryString}` : ''}`)
                .then(response => {
                    resolve(response.data.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    syncStoreProducts(
        id: number,
        notificationChannelId?: number,
        forceSync = false
    ): Promise<{ message: string; data: any }> {  // eslint-disable-line @typescript-eslint/no-explicit-any
        return new Promise<{ message: string; data: any }>((resolve, reject) => {
            this.axiosInstance.post<{ message: string; data: any }>(`v1/stores/${id}/sync`, {  // eslint-disable-line @typescript-eslint/no-explicit-any
                notification_channel_id: notificationChannelId,
                force_sync: forceSync
            })
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

export const storeApi = new StoreApi();
