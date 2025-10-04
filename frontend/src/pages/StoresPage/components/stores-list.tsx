import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2, Plus } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { StoreController } from "@/controllers/store.controller";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { Store } from "@/types/store";
import type { StoresFilterState } from "../types";
import { StoresActiveFilters } from "./stores-active-filters";
import { StoresFilterControls } from "./stores-filter-controls";
import { EditStoreModal } from "./edit-store-modal";
import { CreateStoreModal } from "./create-store-modal";
import { DeleteStoreModal } from "./delete-store-modal";
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";
import type { FilterConfig } from "@/types/filter-api";

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState<StoresFilterState>({
        name: "",
        registration: "",
        active: "ALL"
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [createStoreModal, setCreateStoreModal] = useState(false);
    const [editStoreModal, setEditStoreModal] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });
    const [deleteStoreModal, setDeleteStoreModal] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });

    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const loadStores = useCallback((currentFilters: StoresFilterState) => {
        setIsLoading(true);

        const apiFilters: FilterConfig = {
            filter: {}
        };

        // Adicionar filtro de name
        if (currentFilters.name && currentFilters.name.trim()) {
            apiFilters.filter!.name = { ilike: currentFilters.name.trim() };
        }

        // Adicionar filtro de registration
        if (currentFilters.registration && currentFilters.registration.trim()) {
            apiFilters.filter!.registration = { ilike: currentFilters.registration.trim() };
        }

        // Adicionar filtro de active/inactive
        if (currentFilters.active !== "ALL") {
            const activeValue = currentFilters.active === "true";
            apiFilters.filter!.active = { eq: activeValue };
        }

        // Se não tiver filtros, remover o objeto vazio
        if (Object.keys(apiFilters.filter!).length === 0) {
            delete apiFilters.filter;
        }

        StoreController.getAllStores(apiFilters.filter)
            .then(response => {
                setStores(response ?? []);
            })
            .catch(error => {
                toast.error("Erro ao carregar lojas", {
                    description: error.message || 'Erro desconhecido'
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadStores({
            name: "",
            registration: "",
            active: "ALL"
        });
    }, [loadStores]);

    const handleFilterChange = (key: keyof StoresFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const handleApplyFilters = () => {
        loadStores(filters);
    };

    const handleRemoveFilter = (key: keyof StoresFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadStores(newFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.name) count++;
        if (filters.registration) count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

    const handleClearFilters = () => {
        setFilters({
            name: "",
            registration: "",
            active: "ALL"
        });
    };

    const handleEditStore = (store: Store) => {
        setEditStoreModal({ isOpen: true, store });
    };

    const handleDeleteStore = (store: Store) => {
        setDeleteStoreModal({ isOpen: true, store });
    };

    const handleModalSuccess = () => {
        loadStores(filters);
    };

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
            header: 'Documento',
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
            id: 'created_at',
            header: 'Criado em',
            accessorKey: 'created_at',
            cell: ({ row }: CellProps) => (
                new Date(row.original.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            )
        },
        {
            id: 'actions',
            header: 'Ações',
            accessorKey: 'id',
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
            <PageCard cardTitle="Lista de Lojas" cardExtra={(
                <StoresFilterControls
                    activeFiltersCount={getActiveFiltersCount()}
                    onClearFilters={handleClearFilters}
                    onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
                />
            )}>
                <StoresActiveFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onRemoveFilter={handleRemoveFilter}
                    isExpanded={isFiltersExpanded}
                    isLoading={isLoading}
                />
                <DataTable
                    columns={tableColumns}
                    data={stores}
                    isLoading={isLoading}
                    showPagination={true}
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