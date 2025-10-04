/**
 * Estrutura de erro padrão da API
 */
export interface ApiError {
    statusCode: number;
    errorCode?: number;
    message: string | string[];
    error?: string;
}

export interface PaginationMetadata {
    limit: number;
    offset: number;
    total: number;
}


/**
 * Resposta genérica da API com tipagem
 */
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    metadata?: PaginationMetadata;
    message?: string;
}
