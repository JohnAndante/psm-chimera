import { Request, Response, NextFunction } from 'express';
import { FilterResult } from '../types/query.type';

export interface QueryFieldConfig {
    type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
    sortable?: boolean;
    filterable?: boolean;
    enumValues?: string[]; // Para validação de enum
}

export interface QueryConfig {
    [field: string]: QueryFieldConfig | string; // string é atalho para { type: 'string', sortable: true, filterable: true }
}

export interface ParsedQuery {
    filters: FilterResult;
    pagination: {
        limit: number;
        offset: number;
    };
    sorting?: Record<string, 'asc' | 'desc'>;
}

/**
 * Middleware unificado para processar filtros, paginação e ordenação
 */
export function queryMiddleware(config: QueryConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];
        const query = req.query || {};

        // ==================== CONFIGURAÇÃO ====================
        // Validar e normalizar configuração

        // Normalizar configuração (converter strings em objetos completos)
        const normalizedConfig: Record<string, QueryFieldConfig> = {};
        for (const [field, value] of Object.entries(config)) {
            if (typeof value === 'string') {
                normalizedConfig[field] = {
                    type: value as any,
                    sortable: true,
                    filterable: true
                };
            } else {
                normalizedConfig[field] = {
                    sortable: true,
                    filterable: true,
                    ...value
                };
            }
        }

        console.log('🔧 Query Middleware - Configuração:', normalizedConfig);
        console.log('🔍 Query Parameters:', query);

        // ==================== FILTROS ====================
        const filters: FilterResult = {};

        // Processar search simples
        if (query.search && typeof query.search === 'string') {
            filters.search = { eq: query.search };
            console.log(`🔎 Search term: "${query.search}"`);
        }

        // Processar filtros aninhados filter[field][operator]
        Object.keys(query).forEach(key => {
            const match = key.match(/^filter\[(.+?)\]\[(.+?)\]$/);
            if (match) {
                const [, field, operator] = match;
                const value = query[key] as string;

                // Verificar se o campo existe e é filtrável
                const fieldConfig = normalizedConfig[field];
                if (!fieldConfig) {
                    errors.push(`Campo de filtro desconhecido: ${field}`);
                    return;
                }

                if (fieldConfig.filterable === false) {
                    errors.push(`Campo não filtrável: ${field}`);
                    return;
                }

                // Validar enum
                if (fieldConfig.type === 'enum' && fieldConfig.enumValues) {
                    if (!fieldConfig.enumValues.includes(value)) {
                        errors.push(`Valor inválido para ${field}. Valores aceitos: ${fieldConfig.enumValues.join(', ')}`);
                        return;
                    }
                }

                // Converter valor de acordo com o tipo
                const processedValue = parseValueByType(value, fieldConfig.type);

                if (!filters[field]) {
                    filters[field] = {};
                }

                // @ts-ignore
                filters[field][operator] = processedValue;
                console.log(`📌 Filtro: ${field} ${operator} ${processedValue}`);
            }
        });

        req.filters = filters;

        // ==================== PAGINAÇÃO ====================
        const page = query.page ? parseInt(query.page as string, 10) : 1;
        const limit = query.limit ? parseInt(query.limit as string, 10) : 10;

        if (isNaN(page) || page < 1) {
            errors.push('page deve ser um número inteiro maior ou igual a 1');
        }

        if (isNaN(limit) || limit < 1 || limit > 100) {
            errors.push('limit deve ser um número entre 1 e 100');
        }

        const offset = (page - 1) * limit;

        req.pagination = {
            limit,
            offset,
            page,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false
        };

        console.log(`📄 Paginação: page=${page}, limit=${limit}, offset=${offset}`);

        // ==================== ORDENAÇÃO ====================
        const sorting: Record<string, 'asc' | 'desc'> = {};

        Object.keys(query).forEach(key => {
            const match = key.match(/^order\[(.+?)\]$/);
            if (match) {
                const [, field] = match;
                const direction = query[key] as string;

                // Verificar se o campo existe e é ordenável
                const fieldConfig = normalizedConfig[field];
                if (!fieldConfig) {
                    errors.push(`Campo de ordenação desconhecido: ${field}`);
                    return;
                }

                if (fieldConfig.sortable === false) {
                    errors.push(`Campo não ordenável: ${field}`);
                    return;
                }

                // Validar direção
                if (direction !== 'asc' && direction !== 'desc') {
                    errors.push(`Direção de ordenação inválida para ${field}. Use 'asc' ou 'desc'`);
                    return;
                }

                sorting[field] = direction as 'asc' | 'desc';
                console.log(`🔽 Ordenação: ${field} ${direction}`);
            }
        });

        if (Object.keys(sorting).length > 0) {
            req.sorting = sorting;
        }

        // ==================== VALIDAÇÃO ====================
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Parâmetros de query inválidos',
                details: errors
            });
        }

        next();
    };
}

function parseValueByType(value: string, type: string): any {
    switch (type) {
        case 'boolean':
            return value.toLowerCase() === 'true';
        case 'number':
            return Number(value);
        case 'date':
            return new Date(value);
        case 'enum':
        case 'string':
        default:
            return value;
    }
}
