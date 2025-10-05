import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FilterConfig } from '@/types/filter-api';

export interface PaginationState {
    page: number;
    limit: number;
}

export interface SortingState {
    id: string;
    desc: boolean;
}

export interface TableMetadata {
    limit: number;
    offset: number;
    total: number;
}

export interface UseTableDataOptions<T> {
    /**
     * Função que busca os dados da API
     * Recebe FilterConfig e retorna Promise com data e metadata
     */
    fetchFn: (filters: FilterConfig) => Promise<{
        data: T[];
        metadata?: TableMetadata;
    }>;

    /**
     * Filtros iniciais a serem aplicados
     */
    initialFilters?: FilterConfig;

    /**
     * Página inicial (começa em 1)
     */
    initialPage?: number;

    /**
     * Limite inicial de registros por página
     */
    initialLimit?: number;

    /**
     * Ordenação inicial
     */
    initialSorting?: SortingState[];

    /**
     * Se deve fazer fetch automático ao montar
     */
    autoFetch?: boolean;

    /**
     * Callback chamado quando ocorre erro no fetch
     */
    onError?: (error: Error) => void;
}

export interface UseTableDataReturn<T> {
    /** Dados da página atual */
    data: T[];

    /** Metadados retornados pela API */
    metadata: TableMetadata | null;

    /** Estado de carregamento */
    isLoading: boolean;

    /** Estado atual de paginação */
    pagination: PaginationState;

    /** Estado atual de ordenação */
    sorting: SortingState[];

    /** Filtros ativos */
    filters: FilterConfig;

    /** Total de páginas calculado */
    pageCount: number;

    /** Total de registros */
    totalRecords: number;

    /** Atualiza paginação (page ou limit) */
    handlePaginationChange: (updater: Partial<PaginationState>) => void;

    /** Atualiza ordenação */
    handleSortingChange: (sorting: SortingState[]) => void;

    /** Atualiza filtros */
    handleFiltersChange: (filters: FilterConfig) => void;

    /** Recarrega dados manualmente */
    refetch: () => void;
}

/**
 * Hook para gerenciar dados de tabelas com paginação, ordenação e filtros server-side
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   pagination,
 *   handlePaginationChange,
 *   totalRecords
 * } = useTableData({
 *   fetchFn: (filters) => usersApi.list(filters),
 *   initialPage: 1,
 *   initialLimit: 10
 * });
 * ```
 */
export function useTableData<T>({
    fetchFn,
    initialFilters,
    initialPage = 1,
    initialLimit = 10,
    initialSorting = [],
    autoFetch = true,
    onError
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [metadata, setMetadata] = useState<TableMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPage,
        limit: initialLimit
    });

    const [sorting, setSorting] = useState<SortingState[]>(initialSorting);
    const [filters, setFilters] = useState<FilterConfig>(() => initialFilters ?? {});

    /**
     * Busca dados da API com os parâmetros atuais
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            // Construir FilterConfig completo com paginação e ordenação
            const fullFilters: FilterConfig = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            // Adicionar ordenação se houver
            // Converter de SortingState[] para Record<string, 'asc' | 'desc'>
            if (sorting.length > 0) {
                const orderBy: Record<string, 'asc' | 'desc'> = {};
                sorting.forEach(s => {
                    orderBy[s.id] = s.desc ? 'desc' : 'asc';
                });
                fullFilters.orderBy = orderBy;
            }

            const response = await fetchFn(fullFilters);

            setData(response.data || []);
            setMetadata(response.metadata || null);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setData([]);
            setMetadata(null);

            // Chamar callback de erro se fornecido
            if (onError && error instanceof Error) {
                onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, filters, pagination, sorting, onError]);

    /**
     * Atualiza paginação e recarrega dados
     */
    const handlePaginationChange = useCallback((updater: Partial<PaginationState>) => {
        setPagination(prev => {
            const newPagination = { ...prev, ...updater };

            // Se mudou o limit, volta pra primeira página
            if (updater.limit !== undefined && updater.limit !== prev.limit) {
                newPagination.page = 1;
            }

            return newPagination;
        });
    }, []);

    /**
     * Atualiza ordenação e recarrega dados
     */
    const handleSortingChange = useCallback((newSorting: SortingState[]) => {
        setSorting(newSorting);
        // Volta pra primeira página quando muda ordenação
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    /**
     * Atualiza filtros e recarrega dados
     */
    const handleFiltersChange = useCallback((newFilters: FilterConfig) => {
        setFilters(newFilters);
        // Volta pra primeira página quando muda filtros
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    /**
     * Calcula total de páginas
     */
    const pageCount = useMemo(() => {
        return metadata
            ? Math.ceil(metadata.total / pagination.limit)
            : 0;
    }, [metadata, pagination.limit]);

    /**
     * Total de registros
     */
    const totalRecords = useMemo(() => {
        return metadata?.total || 0;
    }, [metadata]);

    /**
     * Efeito separado para reagir a mudanças nos initialFilters
     * Quando mudam, atualiza o estado interno
     */
    useEffect(() => {
        // Only update internal filters when an explicit initialFilters value is provided
        // (prevents an implicit, freshly created empty object from triggering updates).
        if (initialFilters !== undefined) {
            setFilters(initialFilters);
            setPagination(prev => ({ ...prev, page: 1 })); // Volta para primeira página
        }
    }, [initialFilters]);

    /**
     * Efeito para recarregar dados quando mudam os parâmetros
     * IMPORTANTE: Monitora valores primitivos (page, limit), sorting E filters
     * O fetchFn deve ser estável (não deve mudar a cada render)
     */
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, sorting, filters, autoFetch]);

    return {
        data,
        metadata,
        isLoading,
        pagination,
        sorting,
        filters,
        pageCount,
        totalRecords,
        handlePaginationChange,
        handleSortingChange,
        handleFiltersChange,
        refetch: fetchData
    };
}
