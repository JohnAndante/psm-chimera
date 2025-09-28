import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@/types/api';
import { APP_CONFIG } from '@/constants/app';
import { getCurrentToken } from '@/lib/auth';

// ===========================
// Base API Class - Compartilhada por todos os controllers
// ===========================

/**
 * Helper para processar respostas do Axios
 */
export function handleAxiosResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
        status: response.status,
        data: response.data,
    };
}

/**
 * Helper para processar erros do Axios
 */
export function handleAxiosError(error: AxiosError): ApiResponse<never> {
    if (error.response) {
        return {
            status: error.response.status,
            error: error.response.data as ApiError,
        };
    } else if (error.request) {
        return {
            status: 0,
            error: {
                statusCode: 0,
                message: 'Erro de conexão ao servidor',
            },
        };
    } else {
        return {
            status: 0,
            error: {
                statusCode: 0,
                message: error.message || 'Erro desconhecido',
            },
        };
    }
}

/**
 * Cria uma instância configurada do Axios com interceptors
 */
export function createApiInstance(baseUrl = APP_CONFIG.api.baseUrl): AxiosInstance {
    const instance = axios.create({
        baseURL: baseUrl,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        } as Record<string, string>,
    });

    // Request interceptor para adicionar token automaticamente
    instance.interceptors.request.use(
        (config) => {
            const token = getCurrentToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
}
