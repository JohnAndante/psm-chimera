import { type AxiosInstance, AxiosError } from 'axios';
import type {
    LoginRequest,
    LoginResponse,
} from '../types/auth';
import type { ApiResponse } from '../types/api';

import { AUTH_ENDPOINTS } from '@/constants/auth';
import { createApiInstance, handleAxiosResponse, handleAxiosError } from '@/controllers/base-api';

// ===========================
// Auth API Class
// ===========================

class AuthApi {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = createApiInstance();
    }

    /**
     * Realiza login do usuário
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        try {
            const response = await this.axiosInstance.post<LoginResponse>(
                AUTH_ENDPOINTS.LOGIN,
                credentials
            );
            return handleAxiosResponse(response);
        } catch (error) {
            return handleAxiosError(error as AxiosError);
        }
    }
}

// ===========================
// Instância e Exports
// ===========================

export const authApi = new AuthApi();
