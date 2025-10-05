import { useState, useCallback } from "react";
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

export default function UsersPage() {
    const [filters, setFilters] = useState<UsersFilterState>({
        name: "",
        role: "ALL",
        active: "ALL"
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [createUserModal, setCreateUserModal] = useState(false);
    const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });
    const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });
    const [changePasswordModal, setChangePasswordModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({ isOpen: false, user: null });

    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    // Função de fetch memoizada para evitar recriações desnecessárias
    const fetchUsers = useCallback(async (filterConfig: FilterConfig) => {
        // Adicionar filtro de name
        if (filters.name && filters.name.trim()) {
            if (!filterConfig.filter) filterConfig.filter = {};
            filterConfig.filter.name = { ilike: filters.name.trim() };
        }

        // Adicionar filtro de role
        if (filters.role !== "ALL") {
            if (!filterConfig.filter) filterConfig.filter = {};
            filterConfig.filter.role = { eq: filters.role };
        }

        // Adicionar filtro de active/inactive
        if (filters.active !== "ALL") {
            if (!filterConfig.filter) filterConfig.filter = {};
            const activeValue = filters.active === "true";
            filterConfig.filter.active = { eq: activeValue };
        }

        const response = await usersApi.list(filterConfig);

        return {
            data: response.data ?? [],
            metadata: response.metadata!
        };
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
        fetchFn: fetchUsers,
        onError: (error) => {
            toast.error("Erro ao carregar usuários", {
                description: error.message || 'Erro desconhecido'
            });
        }
    });

    const handleApplyFilters = (newFilters: UsersFilterState) => {
        console.log("Applying filters:", newFilters);
        setFilters(newFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.name) count++;
        if (filters.role !== "ALL") count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

    const handleClearFilters = () => {
        setFilters({
            name: "",
            role: "ALL",
            active: "ALL"
        });
    };

    const handleChangePassword = (user: BaseUser) => {
        setChangePasswordModal({ isOpen: true, user });
    };

    const handleEditUser = (user: BaseUser) => {
        setEditUserModal({ isOpen: true, user });
    };

    const handleDeleteUser = (user: BaseUser) => {
        setDeleteUserModal({ isOpen: true, user });
    };

    const handleModalSuccess = () => {
        refetch();
    };

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

    const getActionButtons = (user: BaseUser) => (
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
    )

    type CellProps = { row: { original: BaseUser } };

    const tableColumns = [
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
            cell: ({ row }: CellProps) => (
                new Date(row.original.createdAt).toLocaleDateString('pt-BR', {
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
            enableSorting: false,
            cell: ({ row }: CellProps) => (
                isAdmin(currentUser) ? getActionButtons(row.original) : '-'
            )
        }
    ];

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
                        activeFiltersCount={getActiveFiltersCount()}
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
