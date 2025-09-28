/**
 * Estrutura de erro padrão da API
 */
export interface ApiError {
    statusCode: number;
    errorCode?: number;
    message: string | string[];
    error?: string;
}


/**
 * Resposta genérica da API com tipagem
 */
export interface ApiResponse<T = any> {
    data?: T;
    error?: ApiError;
    status: number;
}
