import { SelectQueryBuilder, Kysely, sql } from 'kysely';
import {
    FilterResult,
    PaginationResult,
    FilterOperator
} from '../types/filter-pagination.type.js';

/**
 * Query Builder Helper
 *
 * Funções para aplicar filtros e paginação em queries Kysely
 */

/**
 * Aplica um filtro específico à query
 */
function applyFilter<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    field: string,
    operator: FilterOperator,
    value: any
): SelectQueryBuilder<DB, TB, O> {
    const fieldRef = field as any; // Type assertion necessária para Kysely

    switch (operator) {
        case 'eq':
            return query.where(fieldRef, '=', value);

        case 'ne':
            return query.where(fieldRef, '!=', value);

        case 'gt':
            return query.where(fieldRef, '>', value);

        case 'gte':
            return query.where(fieldRef, '>=', value);

        case 'lt':
            return query.where(fieldRef, '<', value);

        case 'lte':
            return query.where(fieldRef, '<=', value);

        case 'like':
            return query.where(fieldRef, 'like', value);

        case 'ilike':
            return query.where(fieldRef, 'ilike', value);

        case 'in':
            return query.where(fieldRef, 'in', value);

        case 'nin':
            return query.where(fieldRef, 'not in', value);

        case 'between':
            return query.where(fieldRef, '>=', value[0]).where(fieldRef, '<=', value[1]);

        case 'null':
            return value
                ? query.where(fieldRef, 'is', null)
                : query.where(fieldRef, 'is not', null);

        default:
            throw new Error(`Unsupported filter operator: ${operator}`);
    }
}

/**
 * Aplica todos os filtros à query
 */
export function applyFilters<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    filters: FilterResult
): SelectQueryBuilder<DB, TB, O> {
    let filteredQuery = query;

    for (const [field, fieldFilters] of Object.entries(filters)) {
        for (const [operator, value] of Object.entries(fieldFilters)) {
            filteredQuery = applyFilter(
                filteredQuery,
                field,
                operator as FilterOperator,
                value
            );
        }
    }

    return filteredQuery;
}

/**
 * Aplica paginação à query
 */
export function applyPagination<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    pagination: PaginationResult
): SelectQueryBuilder<DB, TB, O> {
    let paginatedQuery = query;

    // Aplica limit apenas se não for 0 (unlimited)
    if (pagination.limit > 0) {
        paginatedQuery = paginatedQuery.limit(pagination.limit);
    }

    // Aplica offset
    if (pagination.offset > 0) {
        paginatedQuery = paginatedQuery.offset(pagination.offset);
    }

    return paginatedQuery;
}

/**
 * Helper para criar resposta paginada padrão
 */
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        limit: number;
        offset: number;
        page?: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalPages?: number;
        currentPage?: number;
    };
}

/**
 * Cria resposta paginada padrão
 */
export function createPaginatedResponse<T>(
    data: T[],
    pagination: PaginationResult,
    totalCount: number,
    paginationInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalPages?: number;
        currentPage?: number;
    }
): PaginatedResponse<T> {
    return {
        success: true,
        data,
        pagination: {
            limit: pagination.limit,
            offset: pagination.offset,
            page: pagination.page,
            totalCount,
            ...paginationInfo
        }
    };
}

/**
 * Helper para ordenação dinâmica
 */
export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

/**
 * Aplica ordenação à query
 */
export function applySorting<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    sorting: SortConfig[]
): SelectQueryBuilder<DB, TB, O> {
    let sortedQuery = query;

    for (const sort of sorting) {
        const fieldRef = sort.field as any; // Type assertion necessária para Kysely
        sortedQuery = sortedQuery.orderBy(fieldRef, sort.direction);
    }

    return sortedQuery;
}
