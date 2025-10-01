/**
 * Filter and Pagination Types
 *
 * Tipos para os middlewares de filtro e paginação
 */

// Operadores suportados para filtros
export type FilterOperator =
    | 'eq'      // Equals
    | 'ne'      // Not equals
    | 'gt'      // Greater than
    | 'gte'     // Greater than or equal
    | 'lt'      // Less than
    | 'lte'     // Less than or equal
    | 'like'    // SQL LIKE with wildcards
    | 'ilike'   // Case-insensitive LIKE
    | 'in'      // IN array
    | 'nin'     // NOT IN array
    | 'null'    // IS NULL / IS NOT NULL
    | 'between'; // BETWEEN two values

// Tipos de campo suportados
export type FilterFieldType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'uuid'
    | 'enum';

// Configuração de campo para filtro
export interface FilterFieldConfig {
    type: FilterFieldType;
    operators?: FilterOperator[]; // Se não especificado, usa operadores padrão por tipo
    enumValues?: string[]; // Valores válidos para tipo enum
}

// Configuração do middleware de filtro
export type FilterConfig = Record<string, FilterFieldType | FilterFieldConfig>;

// Resultado do filtro processado
export interface FilterResult {
    [field: string]: {
        [operator in FilterOperator]?: any;
    };
}

// Configuração do middleware de paginação
export interface PaginationConfig {
    defaultLimit?: number;
    maxLimit?: number;
    allowUnlimited?: boolean;
}

// Resultado da paginação processada
export interface PaginationResult {
    limit: number;
    offset: number;
    page?: number;
}

// Resultado completo com dados e contagem
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        offset: number;
    };
}

// Extensões do Request para Express
declare global {
    namespace Express {
        interface Request {
            filters?: FilterResult;
            pagination?: PaginationResult;
        }
    }
}

// Erro de validação
export interface ValidationError {
    field: string;
    operator?: string;
    value?: any;
    message: string;
}

export class FilterValidationError extends Error {
    constructor(public details: ValidationError) {
        super(`Filter validation error: ${details.message}`);
        this.name = 'FilterValidationError';
    }
}

export class PaginationValidationError extends Error {
    constructor(public details: ValidationError) {
        super(`Pagination validation error: ${details.message}`);
        this.name = 'PaginationValidationError';
    }
}

/**
 * Extensões para Express Request
 */
declare module 'express-serve-static-core' {
    interface Request {
        filters?: FilterResult;
        pagination?: PaginationResult;
        calculatePaginationInfo?: (totalCount: number) => {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            totalPages?: number;
            currentPage?: number;
        };
    }
}
