import type { AxiosInstance } from 'axios';

import { createApiInstance } from './base-api';
import type { ListUsersResponse } from '@/types/user-api';
import type { UsersApiFilters } from '@/pages/UsersPage/types';
import { processApiError } from '@/utils/api-error';

// ===========================
// Users API Class
// ===========================

class UsersApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    list(filters?: UsersApiFilters) {
        return new Promise<ListUsersResponse>((resolve, reject) => {
            const params = new URLSearchParams();

            if (filters?.search && filters.search.trim()) {
                params.append('search', filters.search.trim());
            }

            if (filters?.role) {
                params.append('role', filters.role);
            }

            if (filters?.active !== undefined) {
                params.append('active', filters.active.toString());
            }

            const url = params.toString() ? `v1/users?${params.toString()}` : 'v1/users';

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
