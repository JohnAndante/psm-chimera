import type { FilterConfig } from "@/types/filter-api";

export function buildApiUrl(baseUrl: string, filters?: FilterConfig): string {
    if (!filters || Object.keys(filters).length === 0) {
        return baseUrl;
    }

    const params = new URLSearchParams();

    // Filtros aninhados
    if (filters.filter) {
        Object.entries(filters.filter).forEach(([field, operators]) => {
            if (typeof operators === 'object' && operators !== null) {
                Object.entries(operators).forEach(([operator, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(`filter[${field}][${operator}]`, String(value));
                    }
                });
            }
        });
    }

    // Parâmetros simples
    Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'filter' && key !== 'order' && key !== 'orderBy' && value !== undefined) {
            params.append(key, String(value));
        }
    });

    // Ordenação
    if (filters.order) {
        Object.entries(filters.order).forEach(([field, direction]) => {
            params.append(`order[${field}]`, direction);
        });
    }

    // Ordenação (compatibilidade com orderBy)
    if (filters.orderBy) {
        Object.entries(filters.orderBy).forEach(([field, direction]) => {
            params.append(`order[${field}]`, direction);
        });
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
