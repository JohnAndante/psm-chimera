import type { AxiosInstance } from 'axios';

import { createApiInstance } from './base-api';
import { processApiError } from '@/utils/api-error';
import { buildApiUrl } from '@/utils/build-api-url';
import type { FilterConfig } from '@/types/filter-api';
import type { ApiResponse } from '@/types';
import type { BaseUser } from '@/types/user-api';

// ===========================
// Users API Class
// ===========================

class UsersApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    list(filters?: FilterConfig) {
        return new Promise<ApiResponse<BaseUser[]>>((resolve, reject) => {
            const url = buildApiUrl('v1/users', filters);

            this.axiosInstance.get(url)
                .then(response => {
                    const { data, metadata } = response.data;
                    resolve({ data, metadata });
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    changePassword(userId: string, newPassword: string) {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.put(`v1/users/${userId}/change-password`, { password: newPassword })
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    update(userId: string, userData: { name: string; email: string; role: "ADMIN" | "USER" }) {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.put(`v1/users/${userId}`, userData)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    create(userData: { name: string; email: string; role: "ADMIN" | "USER"; password: string }) {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.post('v1/users', userData)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }

    delete(userId: string) {
        return new Promise<void>((resolve, reject) => {
            this.axiosInstance.delete(`v1/users/${userId}`)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(processApiError(error));
                });
        });
    }
}

export const usersApi = new UsersApi();
