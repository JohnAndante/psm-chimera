import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2, Plus } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useState, useCallback, useMemo } from "react";
import { storeApi } from "@/controllers/store-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/custom-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { Store } from "@/types/store";
import type { StoresFilterState } from "../types";
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";
import type { FilterConfig } from "@/types/filter-api";
import { CreateStoreModal } from "@/pages/StoresPage/components/create-store-modal";
import { DeleteStoreModal } from "@/pages/StoresPage/components/delete-store-modal";
import { EditStoreModal } from "@/pages/StoresPage/components/edit-store-modal";
import { useTableData } from "@/hooks/use-table-data";
import { FilterControls, FilterFields } from "@/components/data-table";
import { StoreListFilterFields } from "./stores-list-filter-fields";
import { formatDateToBR } from "@/utils/string";

export default function StoresPage() {
    const defaultFilters: StoresFilterState = {
        name: "",
        registration: "",
        active: "ALL"
    };

    const [filters, setFilters] = useState<StoresFilterState>(defaultFilters);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [createStoreModal, setCreateStoreModal] = useState(false);
    const [editStoreModal, setEditStoreModal] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });
    const [deleteStoreModal, setDeleteStoreModal] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });

    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const filterConfig = useMemo<FilterConfig>(() => {
        const config: FilterConfig = {};

        if (filters.name && filters.name.trim()) {
            config.filter = {
                ...config.filter,
                name: { ilike: filters.name.trim() }
            };
        }

        if (filters.registration && filters.registration.trim()) {
            config.filter = {
                ...config.filter,
                registration: { ilike: filters.registration.trim() }
            };
        }

        if (filters.active !== "ALL") {
            const activeValue = filters.active === "true";
            config.filter = {
                ...config.filter,
                active: { eq: activeValue }
            };
        }

        return config;
    }, [filters]);

    const {
        data: stores,
        isLoading,
        pagination,
        metadata,
        sorting,
        handlePaginationChange,
        handleSortingChange,
        refetch,
    } = useTableData<Store>({
        fetchFn: async (config) => {
            const response = await storeApi.list(config);
            return { data: response.data ?? [], metadata: response.metadata };
        },
        initialFilters: filterConfig,
        onError: (error) => {
            toast.error("Erro ao carregar lojas", {
                description: error.message || 'Erro desconhecido'
            });
        }
    })

    const handleApplyFilters = useCallback((newFilters: StoresFilterState) => {
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(defaultFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEditStore = (store: Store) => {
        setEditStoreModal({ isOpen: true, store });
    }

    const handleDeleteStore = (store: Store) => {
        setDeleteStoreModal({ isOpen: true, store });
    }

    const handleModalSuccess = () => {
        refetch();
        toast.success("Operação realizada com sucesso");
    }

    const getActiveBadge = (active: boolean) => {
        const colors = active
            ? "bg-green-500/20 text-green-500"
            : "bg-red-500/20 text-red-500";

        const labels = active ? "Ativa" : "Inativa";

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
                {labels}
            </span>
        );
    }

    const getActionButtons = (store: Store) => (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleEditStore(store)}
                    >
                        <SquarePen size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Editar Loja
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteStore(store)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Deletar Loja
                </TooltipContent>
            </Tooltip>
        </>
    )

    type CellProps = { row: { original: Store } };

    const tableColumns = [
        {
            id: 'name',
            header: 'Nome',
            accessorKey: 'name',
        },
        {
            id: 'registration',
            header: 'Registro',
            accessorKey: 'registration',
        },
        {
            id: 'document',
            header: 'CNPJ',
            accessorKey: 'document',
        },
        {
            id: 'active',
            header: 'Status',
            accessorKey: 'active',
            cell: ({ row }: CellProps) => (
                getActiveBadge(row.original.active)
            )
        },
        {
            id: 'createdAt',
            header: 'Criado em',
            accessorKey: 'createdAt',
            cell: ({ row }: CellProps) => formatDateToBR(row.original.createdAt)
        },
        {
            id: 'actions',
            header: 'Ações',
            accessorKey: 'id',
            enableSorting: false,
            cell: ({ row }: CellProps) => (
                isAdmin(currentUser) ? getActionButtons(row.original) : '-'
            )
        }
    ];

    const breadcrumbs = [
        { label: "Dashboard", to: "/" },
        { label: "Lojas" }
    ];

    const newStoreButton = (
        <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setCreateStoreModal(true)}
        >
            <Plus size={16} />
            Nova Loja
        </Button>
    )

    return (
        <PageContainer
            title="Lojas"
            subtitle="Gerencie as lojas do sistema"
            breadcrumbs={breadcrumbs}
            extra={isAdmin(currentUser) ? newStoreButton : null}
        >
            <PageCard
                cardTitle="Lista de Lojas"
                cardExtra={(
                    <FilterControls
                        currentFilters={filters}
                        defaultFilters={defaultFilters}
                        onClearFilters={handleClearFilters}
                        onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    />
                )}
            >
                <FilterFields
                    filters={filters}
                    onFilterChange={handleApplyFilters}
                    isExpanded={isFiltersExpanded}
                    filterFields={(<StoreListFilterFields isLoading={isLoading} />)}
                    isLoading={isLoading}
                />

                <DataTable
                    columns={tableColumns}
                    data={stores}
                    isLoading={isLoading}
                    showPagination={true}
                    manualPagination={true}
                    pageCount={metadata ? Math.ceil(metadata.total / pagination.limit) : 0}
                    totalRecords={metadata?.total ?? 0}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    manualSorting={true}
                    sorting={sorting}
                    onSortingChange={handleSortingChange}
                />
            </PageCard>

            <EditStoreModal
                isOpen={editStoreModal.isOpen}
                onClose={() => setEditStoreModal({ isOpen: false, store: null })}
                store={editStoreModal.store}
                onSuccess={handleModalSuccess}
            />

            <CreateStoreModal
                isOpen={createStoreModal}
                onClose={() => setCreateStoreModal(false)}
                onSuccess={handleModalSuccess}
            />

            <DeleteStoreModal
                isOpen={deleteStoreModal.isOpen}
                onClose={() => setDeleteStoreModal({ isOpen: false, store: null })}
                store={deleteStoreModal.store}
                onSuccess={handleModalSuccess}
            />
        </PageContainer>
    );
}
