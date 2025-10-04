import type { AxiosInstance } from 'axios';

import { createApiInstance } from './base-api';
import type { ListUsersResponse } from '@/types/user-api';
import type { UsersApiFilters } from '@/pages/UsersPage/types';
import { processApiError } from '@/utils/api-error';
import { buildApiUrl } from '@/utils/build-api-url';
import type { FilterConfig } from '@/types/filter-api';

// ===========================
// Users API Class
// ===========================

class UsersApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    list(filters?: FilterConfig) {
        return new Promise<ListUsersResponse>((resolve, reject) => {
            const url = buildApiUrl('v1/users', filters);

            console.log("URL de requisição:", url); // Para debug

            this.axiosInstance.get(url)
                .then(response => {
                    const { message, data } = response.data;
                    resolve({ message, users: data });
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
