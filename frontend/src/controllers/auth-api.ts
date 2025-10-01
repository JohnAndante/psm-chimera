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

    /**
     * Valida o token JWT no backend
     */
    async validateToken(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.get(AUTH_ENDPOINTS.VALIDATE_TOKEN);
            return response.status === 200;
        } catch (error) {
            console.log('Token validation error:', error);
            return false;
        }
    }
}

// ===========================
// Instância e Exports
// ===========================

export const authApi = new AuthApi();
