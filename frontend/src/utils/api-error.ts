import { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';
import type { ApiErrorResponse } from '@/types/api-error';

/**
 * Processa erros do Axios e retorna uma estrutura padronizada
 */
export function processApiError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        const statusCode = axiosError.response?.status || 500;
        const errorMessage = axiosError.response?.data?.error;

        return {
            statusCode,
            message: errorMessage || axiosError.message || 'Erro desconhecido'
        };
    }

    // Fallback para erros não relacionados ao Axios
    return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
}
