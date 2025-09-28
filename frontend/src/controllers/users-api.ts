import { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

import { createApiInstance } from './base-api';
import type { ListUsersResponse } from '@/types/user-api';
import type { UsersApiFilters } from '@/pages/UsersPage/types';

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
                    const { message, users } = response.data;

                    resolve({ message, users });
                })
                .catch(error => {
                    const axiosError = error as AxiosError;
                    reject({ statusCode: axiosError.response?.status || 500, message: axiosError.message || 'Erro desconhecido' });
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
                    const axiosError = error as AxiosError;
                    reject({ statusCode: axiosError.response?.status || 500, message: axiosError.message || 'Erro desconhecido' });
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
                    const axiosError = error as AxiosError;
                    reject({ statusCode: axiosError.response?.status || 500, message: axiosError.message || 'Erro desconhecido' });
                });
        });
    }
}

export const usersApi = new UsersApi();
