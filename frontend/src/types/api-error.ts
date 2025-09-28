// ===========================
// API Error Types
// ===========================

// Re-export ApiError from api.ts for convenience
export type { ApiError } from './api';

/**
 * Estrutura padrão de erro retornada pela API
 */
export interface ApiErrorResponse {
    error: string;
}

/**
 * Códigos de status HTTP mais comuns
 */
export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Tipos de erro comuns baseados no status code
 */
export type ApiErrorType =
    | 'VALIDATION_ERROR'      // 400
    | 'UNAUTHORIZED'          // 401
    | 'FORBIDDEN'            // 403
    | 'NOT_FOUND'            // 404
    | 'CONFLICT'             // 409 (email já existe, etc)
    | 'SERVER_ERROR'         // 500
    | 'UNKNOWN_ERROR';       // outros

/**
 * Utilitário para identificar o tipo de erro baseado no status code
 */
export function getErrorType(statusCode: number): ApiErrorType {
    switch (statusCode) {
        case HTTP_STATUS.BAD_REQUEST:
            return 'VALIDATION_ERROR';
        case HTTP_STATUS.UNAUTHORIZED:
            return 'UNAUTHORIZED';
        case HTTP_STATUS.FORBIDDEN:
            return 'FORBIDDEN';
        case HTTP_STATUS.NOT_FOUND:
            return 'NOT_FOUND';
        case HTTP_STATUS.CONFLICT:
            return 'CONFLICT';
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
            return 'SERVER_ERROR';
        default:
            return 'UNKNOWN_ERROR';
    }
}
