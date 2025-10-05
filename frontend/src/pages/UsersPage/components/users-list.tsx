import { useState, useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { KeyRound, Plus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/layout/page-card";
import { usersApi } from "@/controllers/users-api";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";
import { useTableData } from "@/hooks/use-table-data";
import { DataTable, FilterControls, FilterFields } from "@/components/data-table";
import {
    UserListFilterFields, DeleteUserModal, CreateUserModal, ChangePasswordModal, EditUserModal
} from "@/pages/UsersPage/components";
import type { BaseUser } from "@/types/user-api";
import type { UsersFilterState } from "@/pages/UsersPage/types";
import type { FilterConfig } from "@/types/filter-api";
import { formatDateToBR } from "@/utils/string";

export default function UsersPage() {
    const defaultFilters: UsersFilterState = {
        name: "",
        role: "ALL",
        active: "ALL"
    };

    const [filters, setFilters] = useState<UsersFilterState>(defaultFilters);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [createUserModal, setCreateUserModal] = useState(false);
    const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });
    const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });
    const [changePasswordModal, setChangePasswordModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });

    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    // Construir FilterConfig baseado nos filtros ativos
    const filterConfig = useMemo<FilterConfig>(() => {
        const config: FilterConfig = {};

        // Adicionar filtro de name
        if (filters.name && filters.name.trim()) {
            if (!config.filter) config.filter = {};
            config.filter.name = { ilike: filters.name.trim() };
        }

        // Adicionar filtro de role
        if (filters.role !== "ALL") {
            if (!config.filter) config.filter = {};
            config.filter.role = { eq: filters.role };
        }

        // Adicionar filtro de active/inactive
        if (filters.active !== "ALL") {
            if (!config.filter) config.filter = {};
            const activeValue = filters.active === "true";
            config.filter.active = { eq: activeValue };
        }

        return config;
    }, [filters.name, filters.role, filters.active]);

    // Usar o hook useTableData para gerenciar dados, paginação e filtros
    const {
        data: users,
        isLoading,
        pagination,
        metadata,
        sorting,
        handlePaginationChange,
        handleSortingChange,
        refetch
    } = useTableData<BaseUser>({
        fetchFn: async (config) => {
            const response = await usersApi.list(config);
            return {
                data: response.data ?? [],
                metadata: response.metadata!
            };
        },
        initialFilters: filterConfig,
        onError: (error) => {
            toast.error("Erro ao carregar usuários", {
                description: error.message || 'Erro desconhecido'
            });
        }
    });

    const handleApplyFilters = useCallback((newFilters: UsersFilterState) => {
        console.log("Applying filters:", newFilters);
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(defaultFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangePassword = useCallback((user: BaseUser) => {
        setChangePasswordModal({ isOpen: true, user });
    }, []);

    const handleEditUser = useCallback((user: BaseUser) => {
        setEditUserModal({ isOpen: true, user });
    }, []);

    const handleDeleteUser = useCallback((user: BaseUser) => {
        setDeleteUserModal({ isOpen: true, user });
    }, []);

    const handleModalSuccess = useCallback(() => {
        refetch();
    }, [refetch]);

    const getRoleLabel = (role: "ADMIN" | "USER") => {
        const colors = {
            ADMIN: "bg-red-500/20 text-red-500",
            USER: "bg-blue-500/20 text-blue-500"
        };

        const labels = {
            ADMIN: "Administrador",
            USER: "Usuário"
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>
                {labels[role]}
            </span>
        );
    }

    const getActionButtons = useCallback((user: BaseUser) => (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer hover:text-yellow-500 transition-colors"
                        onClick={() => handleChangePassword(user)}
                    >
                        <KeyRound size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Alterar senha
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer hover:text-blue-500 transition-colors"
                        onClick={() => handleEditUser(user)}
                    >
                        <SquarePen size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Editar Usuário
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-red-500/70 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteUser(user)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Deletar Usuário
                </TooltipContent>
            </Tooltip>
        </>
    ), [handleChangePassword, handleEditUser, handleDeleteUser]);

    type CellProps = { row: { original: BaseUser } };

    const tableColumns = useMemo(() => [
        {
            id: 'name',
            header: 'Nome',
            accessorKey: 'name',
            enableSorting: true,
        },
        {
            id: 'email',
            header: 'Email',
            accessorKey: 'email',
            enableSorting: true,
        },
        {
            id: 'role',
            header: 'Cargo',
            accessorKey: 'role',
            enableSorting: true,
            cell: ({ row }: CellProps) => (
                getRoleLabel(row.original.role)
            )
        },
        {
            id: 'active',
            header: 'Ativo',
            accessorKey: 'active',
            enableSorting: true,
            cell: ({ row }: CellProps) => (
                row.original.active ? 'Sim' : 'Não'
            )
        },
        {
            id: 'createdAt',
            header: 'Criado em',
            accessorKey: 'createdAt',
            enableSorting: true,
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
    ], [currentUser, getActionButtons]);

    const breadcrumbs = [
        { label: "Dashboard", to: "/" },
        { label: "Usuários" }
    ];

    const newUserButton = (
        <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setCreateUserModal(true)}
        >
            <Plus size={16} />
            Novo Usuário
        </Button>
    )

    return (
        <PageContainer
            title="Usuários"
            subtitle="Gerencie os usuários do sistema"
            breadcrumbs={breadcrumbs}
            extra={isAdmin(currentUser) ? newUserButton : null}
        >
            <PageCard
                cardTitle="Lista de Usuários"
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
                    filterFields={(<UserListFilterFields isLoading={isLoading} />)}
                    isLoading={isLoading}
                />

                <DataTable
                    columns={tableColumns}
                    data={users}
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

            <ChangePasswordModal
                isOpen={changePasswordModal.isOpen}
                onClose={() => setChangePasswordModal({ isOpen: false, user: null })}
                user={changePasswordModal.user}
                onSuccess={handleModalSuccess}
            />

            <EditUserModal
                isOpen={editUserModal.isOpen}
                onClose={() => setEditUserModal({ isOpen: false, user: null })}
                user={editUserModal.user}
                onSuccess={handleModalSuccess}
            />

            <CreateUserModal
                isOpen={createUserModal}
                onClose={() => setCreateUserModal(false)}
                onSuccess={handleModalSuccess}
            />

            <DeleteUserModal
                isOpen={deleteUserModal.isOpen}
                onClose={() => setDeleteUserModal({ isOpen: false, user: null })}
                user={deleteUserModal.user}
                onSuccess={handleModalSuccess}
            />
        </PageContainer>
    );
}
