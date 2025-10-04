import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { KeyRound, Plus, SquarePen, Trash2 } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { usersApi } from "@/controllers/users-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { BaseUser } from "@/types/user-api";
import type { UsersFilterState } from "../types";
import { UsersActiveFilters } from "./users-active-filters";
import { UsersFilterControls } from "./users-filter-controls";
import { ChangePasswordModal } from "./change-password-modal";
import { EditUserModal } from "./edit-user-modal";
import { CreateUserModal } from "./create-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";
import type { FilterConfig } from "@/types/filter-api";

export default function UsersPage() {
    const [users, setUsers] = useState<BaseUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const loadUsers = useCallback((currentFilters: UsersFilterState) => {
        setIsLoading(true);

        const apiFilters: FilterConfig = {
            filter: {}
        };

        // Adicionar filtro de name
        if (currentFilters.name && currentFilters.name.trim()) {
            apiFilters.filter!.name = { ilike: currentFilters.name.trim() };
        }

        // Adicionar filtro de role
        if (currentFilters.role !== "ALL") {
            apiFilters.filter!.role = { eq: currentFilters.role };
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

        usersApi.list(apiFilters)
            .then(response => {
                setUsers(response.users ?? []);
            })
            .catch(error => {
                toast.error("Erro ao carregar usuários", {
                    description: error.message || 'Erro desconhecido'
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadUsers({
            name: "",
            role: "ALL",
            active: "ALL"
        });
    }, [loadUsers]);

    const handleFilterChange = (key: keyof UsersFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const handleApplyFilters = () => {
        loadUsers(filters);
    };

    const handleRemoveFilter = (key: keyof UsersFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadUsers(newFilters);
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
        loadUsers(filters);
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
                        className="cursor-pointer"
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
                        className="cursor-pointer"
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
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
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
        },
        {
            id: 'email',
            header: 'Email',
            accessorKey: 'email',
        },
        {
            id: 'role',
            header: 'Cargo',
            accessorKey: 'role',
            cell: ({ row }: CellProps) => (
                getRoleLabel(row.original.role)
            )
        },
        {
            id: 'active',
            header: 'Ativo',
            accessorKey: 'active',
            cell: ({ row }: CellProps) => (
                row.original.active ? 'Sim' : 'Não'
            )
        },
        {
            id: 'createdAt',
            header: 'Criado em',
            accessorKey: 'createdAt',
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
            <PageCard cardTitle="Lista de Usuários" cardExtra={(
                <UsersFilterControls
                    activeFiltersCount={getActiveFiltersCount()}
                    onClearFilters={handleClearFilters}
                    onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
                />
            )}>
                <UsersActiveFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onRemoveFilter={handleRemoveFilter}
                    isExpanded={isFiltersExpanded}
                    isLoading={isLoading}
                />
                <DataTable
                    columns={tableColumns}
                    data={users}
                    isLoading={isLoading}
                    showPagination={true}
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
