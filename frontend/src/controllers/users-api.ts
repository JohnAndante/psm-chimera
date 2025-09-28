import { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

import { createApiInstance } from './base-api';
import type { ListUsersResponse } from '@/types/user-api';

// ===========================
// Users API Class
// ===========================

class UsersApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    list() {
        return new Promise<ListUsersResponse>((resolve, reject) => {
            this.axiosInstance.get('v1/users')
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
}

export const usersApi = new UsersApi();
