import { SelectQueryBuilder } from 'kysely';
import { FilterResult, FilterOperator, PaginationResult } from '../types/query.type';

export interface ApplyFiltersConfig<DB, TB extends keyof DB, O> {
    query: SelectQueryBuilder<DB, TB, O>;
    filters: FilterResult;
    columnMapping?: Record<string, string>; // Mapeia campo da URL -> coluna do banco
    searchFields?: string[]; // Campos onde aplicar busca por search term
}

/**
 * Aplica um único filtro à query
 */
function applyFilter<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    field: string,
    operator: FilterOperator,
    value: any
): SelectQueryBuilder<DB, TB, O> {
    switch (operator) {
        case 'eq':
            return query.where(field as any, '=', value);
        case 'ne':
            return query.where(field as any, '!=', value);
        case 'gt':
            return query.where(field as any, '>', value);
        case 'gte':
            return query.where(field as any, '>=', value);
        case 'lt':
            return query.where(field as any, '<', value);
        case 'lte':
            return query.where(field as any, '<=', value);
        case 'in':
            return query.where(field as any, 'in', value);
        case 'nin':
        case 'notIn':
            return query.where(field as any, 'not in', value);
        case 'like':
        case 'contains':
        case 'ilike':
            return query.where(field as any, 'ilike', `%${value}%`);
        case 'startsWith':
            return query.where(field as any, 'like', `${value}%`);
        case 'endsWith':
            return query.where(field as any, 'like', `%${value}`);
        case 'isNull':
            return query.where(field as any, 'is', null);
        case 'isNotNull':
            return query.where(field as any, 'is not', null);
        default:
            console.warn(`Operador desconhecido: ${operator}`);
            return query;
    }
}

/**
 * Aplica todos os filtros à query com suporte a mapeamento de colunas e busca em múltiplos campos
 */
export function applyFilters<DB, TB extends keyof DB, O>(
    config: ApplyFiltersConfig<DB, TB, O>
): SelectQueryBuilder<DB, TB, O> {
    const { query, filters, columnMapping = {}, searchFields = [] } = config;
    let filteredQuery = query;

    console.log('🔧 Aplicando filtros:', JSON.stringify(filters, null, 2));
    console.log('🗺️ Mapeamento de colunas:', columnMapping);
    console.log('🔍 Campos de busca:', searchFields);

    // Extrair e processar o termo de busca separadamente
    const searchTerm = filters.search?.eq as string | undefined;
    const otherFilters = { ...filters };
    delete otherFilters.search;

    // Aplicar busca em múltiplos campos se houver searchTerm e searchFields
    if (searchTerm && searchFields.length > 0) {
        console.log(`🔎 Aplicando busca por "${searchTerm}" nos campos:`, searchFields);

        filteredQuery = filteredQuery.where((eb) => {
            const conditions = searchFields.map(field =>
                eb(field as any, 'ilike', `%${searchTerm}%`)
            );
            return eb.or(conditions);
        });
    }

    // Aplicar filtros específicos com mapeamento de colunas
    for (const [field, fieldFilters] of Object.entries(otherFilters)) {
        // Mapear o campo para a coluna correta do banco, se definido
        const mappedField = columnMapping[field] || field;

        console.log(`📌 Aplicando filtros para campo: ${field} -> ${mappedField}`);

        for (const [operator, value] of Object.entries(fieldFilters)) {
            console.log(`   ✓ ${mappedField} ${operator} ${value}`);
            filteredQuery = applyFilter(
                filteredQuery,
                mappedField,
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
    return query
        .limit(pagination.limit)
        .offset(pagination.offset);
}

/**
 * Aplica ordenação à query
 */
export function applySorting<DB, TB extends keyof DB, O>(
    query: SelectQueryBuilder<DB, TB, O>,
    sorting?: Record<string, 'asc' | 'desc'>,
    columnMapping?: Record<string, string>
): SelectQueryBuilder<DB, TB, O> {
    if (!sorting) return query;

    let sortedQuery = query;

    for (const [field, direction] of Object.entries(sorting)) {
        const mappedField = columnMapping?.[field] || field;
        console.log(`🔽 Ordenando por: ${mappedField} ${direction}`);
        sortedQuery = sortedQuery.orderBy(mappedField as any, direction);
    }

    return sortedQuery;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}
