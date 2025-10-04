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
export interface FilterConfig {
    filter?: {
        [field: string]: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [operator: string]: FilterOperator | string | number | boolean | null | any[]; // Valor do filtro
        } | string | number | boolean | null;
    };
    page?: number;
    limit?: number;
    order?: Record<string, 'asc' | 'desc'>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    search?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface PaginationResult {
    limit: number;
    offset: number;
    page: number;
}
