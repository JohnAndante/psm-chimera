export type FilterOperator =
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn'
    | 'like'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'isNull'
    | 'isNotNull';

export interface FilterResult {
    [field: string]: {
        [operator in FilterOperator]?: any;
    };
}

export interface PaginationResult {
    limit: number;
    offset: number;
    page?: number;
    totalCount?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

// Estender a interface Request do Express
declare global {
    namespace Express {
        interface Request {
            filters?: FilterResult;
            pagination?: PaginationResult;
            sorting?: Record<string, 'asc' | 'desc'>;
        }
    }
}


export { };
