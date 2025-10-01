import { Request, Response, NextFunction } from 'express';
import {
    FilterConfig,
    FilterResult,
    FilterOperator,
    FilterFieldType,
    FilterFieldConfig,
    FilterValidationError,
    ValidationError
} from '../types/filter-pagination.type.js';

/**
 * Filter Middleware
 *
 * Middleware para processar e validar filtros de busca
 * Injeta os filtros processados em req.filters
 */

// Operadores padrão por tipo de campo
const DEFAULT_OPERATORS: Record<FilterFieldType, FilterOperator[]> = {
    string: ['eq', 'ne', 'like', 'ilike', 'in', 'nin', 'null'],
    number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'between', 'null'],
    boolean: ['eq', 'ne', 'null'],
    date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'null'],
    uuid: ['eq', 'ne', 'in', 'nin', 'null'],
    enum: ['eq', 'ne', 'in', 'nin', 'null']
};

/**
 * Valida valor baseado no tipo de campo e operador
 */
function validateFieldValue(
    field: string,
    operator: FilterOperator,
    value: any,
    fieldConfig: FilterFieldConfig
): ValidationError | null {
    // Validação específica por operador
    switch (operator) {
        case 'in':
        case 'nin':
            if (!Array.isArray(value)) {
                return {
                    field,
                    operator,
                    value,
                    message: `Operator '${operator}' requires an array value`
                };
            }
            break;

        case 'between':
            if (!Array.isArray(value) || value.length !== 2) {
                return {
                    field,
                    operator,
                    value,
                    message: `Operator 'between' requires an array with exactly 2 values`
                };
            }
            break;

        case 'null':
            if (typeof value !== 'boolean') {
                return {
                    field,
                    operator,
                    value,
                    message: `Operator 'null' requires a boolean value`
                };
            }
            break;
    }

    // Validação específica por tipo
    switch (fieldConfig.type) {
        case 'number':
            const validateNumber = (val: any) => {
                const num = Number(val);
                return !isNaN(num) && isFinite(num);
            };

            if (operator === 'in' || operator === 'nin') {
                if (!value.every(validateNumber)) {
                    return {
                        field,
                        operator,
                        value,
                        message: `All values must be valid numbers for field '${field}'`
                    };
                }
            } else if (operator === 'between') {
                if (!value.every(validateNumber)) {
                    return {
                        field,
                        operator,
                        value,
                        message: `Between values must be valid numbers for field '${field}'`
                    };
                }
            } else if (operator !== 'null' && !validateNumber(value)) {
                return {
                    field,
                    operator,
                    value,
                    message: `Value must be a valid number for field '${field}'`
                };
            }
            break;

        case 'boolean':
            if (operator !== 'null' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                return {
                    field,
                    operator,
                    value,
                    message: `Value must be a boolean for field '${field}'`
                };
            }
            break;

        case 'date':
            const validateDate = (val: any) => {
                const date = new Date(val);
                return !isNaN(date.getTime());
            };

            if (operator === 'between') {
                if (!value.every(validateDate)) {
                    return {
                        field,
                        operator,
                        value,
                        message: `Between values must be valid dates for field '${field}'`
                    };
                }
            } else if (operator !== 'null' && !validateDate(value)) {
                return {
                    field,
                    operator,
                    value,
                    message: `Value must be a valid date for field '${field}'`
                };
            }
            break;

        case 'enum':
            if (fieldConfig.enumValues && operator !== 'null') {
                const checkEnumValue = (val: any) => fieldConfig.enumValues!.includes(val);

                if (operator === 'in' || operator === 'nin') {
                    if (!value.every(checkEnumValue)) {
                        return {
                            field,
                            operator,
                            value,
                            message: `All values must be valid enum values for field '${field}'. Valid values: ${fieldConfig.enumValues.join(', ')}`
                        };
                    }
                } else if (!checkEnumValue(value)) {
                    return {
                        field,
                        operator,
                        value,
                        message: `Value must be a valid enum value for field '${field}'. Valid values: ${fieldConfig.enumValues.join(', ')}`
                    };
                }
            }
            break;
    }

    return null;
}

/**
 * Normaliza configuração de campo
 */
function normalizeFieldConfig(fieldConfig: FilterFieldType | FilterFieldConfig): FilterFieldConfig {
    if (typeof fieldConfig === 'string') {
        return {
            type: fieldConfig,
            operators: DEFAULT_OPERATORS[fieldConfig]
        };
    }

    return {
        ...fieldConfig,
        operators: fieldConfig.operators || DEFAULT_OPERATORS[fieldConfig.type]
    };
}

/**
 * Processa filtros do query string
 */
function parseFilters(query: any, config: FilterConfig): FilterResult {
    const filters: FilterResult = {};

    if (!query.filter || typeof query.filter !== 'object') {
        return filters;
    }

    for (const [field, fieldFilters] of Object.entries(query.filter)) {
        // Verifica se o campo é permitido
        if (!config[field]) {
            throw new FilterValidationError({
                field,
                message: `Field '${field}' is not allowed for filtering`
            });
        }

        const fieldConfig = normalizeFieldConfig(config[field]);

        if (typeof fieldFilters !== 'object' || fieldFilters === null) {
            continue;
        }

        filters[field] = {};

        for (const [operator, value] of Object.entries(fieldFilters)) {
            // Verifica se o operador é válido
            if (!fieldConfig.operators!.includes(operator as FilterOperator)) {
                throw new FilterValidationError({
                    field,
                    operator,
                    message: `Operator '${operator}' is not supported for field '${field}' of type '${fieldConfig.type}'`
                });
            }

            // Valida o valor
            const validationError = validateFieldValue(field, operator as FilterOperator, value, fieldConfig);
            if (validationError) {
                throw new FilterValidationError(validationError);
            }

            // Converte valores para tipos apropriados
            let processedValue = value;

            if (operator !== 'null') {
                switch (fieldConfig.type) {
                    case 'number':
                        if (operator === 'in' || operator === 'nin' || operator === 'between') {
                            processedValue = value.map(Number);
                        } else {
                            processedValue = Number(value);
                        }
                        break;

                    case 'boolean':
                        processedValue = value === true || value === 'true';
                        break;

                    case 'date':
                        if (operator === 'between') {
                            processedValue = value.map((v: any) => new Date(v));
                        } else {
                            processedValue = new Date(value);
                        }
                        break;
                }
            }

            filters[field][operator as FilterOperator] = processedValue;
        }
    }

    return filters;
}

/**
 * Middleware de filtro
 */
export function filterMiddleware(config: FilterConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.filters = parseFilters(req.query, config);
            next();
        } catch (error) {
            if (error instanceof FilterValidationError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid filter',
                    details: error.details
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Internal server error processing filters'
            });
        }
    };
}
