import { Request, Response, NextFunction } from 'express';
import {
    PaginationConfig,
    PaginationResult,
    PaginationValidationError,
    ValidationError
} from '../types/filter-pagination.type.js';

/**
 * Pagination Middleware
 *
 * Middleware para processar e validar parâmetros de paginação
 * Injeta as informações de paginação em req.pagination
 */

// Configuração padrão
const DEFAULT_CONFIG: Required<PaginationConfig> = {
    defaultLimit: 10,
    maxLimit: 100,
    allowUnlimited: false
};

/**
 * Valida valor de limit
 */
function validateLimit(limit: any, config: Required<PaginationConfig>): ValidationError | null {
    // Verifica se é número
    const numLimit = Number(limit);
    if (isNaN(numLimit) || !isFinite(numLimit)) {
        return {
            field: 'limit',
            value: limit,
            message: 'Limit must be a valid number'
        };
    }

    // Verifica se é inteiro positivo
    if (!Number.isInteger(numLimit) || numLimit < 0) {
        return {
            field: 'limit',
            value: limit,
            message: 'Limit must be a positive integer'
        };
    }

    // Verifica limite máximo
    if (numLimit > config.maxLimit && !config.allowUnlimited) {
        return {
            field: 'limit',
            value: limit,
            message: `Limit cannot exceed ${config.maxLimit}`
        };
    }

    return null;
}

/**
 * Valida valor de offset
 */
function validateOffset(offset: any): ValidationError | null {
    // Verifica se é número
    const numOffset = Number(offset);
    if (isNaN(numOffset) || !isFinite(numOffset)) {
        return {
            field: 'offset',
            value: offset,
            message: 'Offset must be a valid number'
        };
    }

    // Verifica se é inteiro não negativo
    if (!Number.isInteger(numOffset) || numOffset < 0) {
        return {
            field: 'offset',
            value: offset,
            message: 'Offset must be a non-negative integer'
        };
    }

    return null;
}

/**
 * Valida valor de page
 */
function validatePage(page: any): ValidationError | null {
    // Verifica se é número
    const numPage = Number(page);
    if (isNaN(numPage) || !isFinite(numPage)) {
        return {
            field: 'page',
            value: page,
            message: 'Page must be a valid number'
        };
    }

    // Verifica se é inteiro positivo
    if (!Number.isInteger(numPage) || numPage < 1) {
        return {
            field: 'page',
            value: page,
            message: 'Page must be a positive integer starting from 1'
        };
    }

    return null;
}

/**
 * Processa parâmetros de paginação
 */
function parsePagination(query: any, config: Required<PaginationConfig>): PaginationResult {
    let limit = config.defaultLimit;
    let offset = 0;
    let page: number | undefined;

    // Processa limit
    if (query.limit !== undefined) {
        const limitError = validateLimit(query.limit, config);
        if (limitError) {
            throw new PaginationValidationError(limitError);
        }

        const numLimit = Number(query.limit);

        // Permite limite 0 para "sem limite" apenas se allowUnlimited for true
        if (numLimit === 0 && config.allowUnlimited) {
            limit = 0; // 0 significa sem limite
        } else if (numLimit === 0) {
            throw new PaginationValidationError({
                field: 'limit',
                value: query.limit,
                message: 'Unlimited pagination is not allowed'
            });
        } else {
            limit = numLimit;
        }
    }

    // Processa offset vs page (mutuamente exclusivos)
    if (query.offset !== undefined && query.page !== undefined) {
        throw new PaginationValidationError({
            field: 'pagination',
            message: 'Cannot use both offset and page parameters simultaneously'
        });
    }

    if (query.offset !== undefined) {
        const offsetError = validateOffset(query.offset);
        if (offsetError) {
            throw new PaginationValidationError(offsetError);
        }
        offset = Number(query.offset);
    } else if (query.page !== undefined) {
        const pageError = validatePage(query.page);
        if (pageError) {
            throw new PaginationValidationError(pageError);
        }
        page = Number(query.page);
        offset = (page - 1) * limit;
    }

    const result: PaginationResult = {
        limit,
        offset
    };

    // Inclui page apenas se foi fornecido
    if (page !== undefined) {
        result.page = page;
    }

    return result;
}

/**
 * Calcula informações de paginação para resposta
 */
function calculatePaginationInfo(
    pagination: PaginationResult,
    totalCount: number
): {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages?: number;
    currentPage?: number;
} {
    const { limit, offset, page } = pagination;

    // Se limit é 0 (sem limite), não há paginação
    if (limit === 0) {
        return {
            hasNextPage: false,
            hasPreviousPage: false
        };
    }

    const hasNextPage = (offset + limit) < totalCount;
    const hasPreviousPage = offset > 0;

    // Calcula informações de página se estiver usando paginação baseada em página
    if (page !== undefined) {
        const totalPages = Math.ceil(totalCount / limit);
        return {
            hasNextPage,
            hasPreviousPage,
            totalPages,
            currentPage: page
        };
    }

    return {
        hasNextPage,
        hasPreviousPage
    };
}

/**
 * Middleware de paginação
 */
export function paginationMiddleware(config: PaginationConfig = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.pagination = parsePagination(req.query, fullConfig);

            // Adiciona função helper para calcular informações de paginação
            req.calculatePaginationInfo = (totalCount: number) =>
                calculatePaginationInfo(req.pagination!, totalCount);

            next();
        } catch (error) {
            if (error instanceof PaginationValidationError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid pagination',
                    details: error.details
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Internal server error processing pagination'
            });
        }
    };
}

// Export do helper para uso direto
export { calculatePaginationInfo };
