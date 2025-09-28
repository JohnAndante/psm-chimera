import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { KeyRound, Plus, SquarePen } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { usersApi } from "@/controllers/users-api";
import type { BaseUser } from "@/types/user-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { UsersFilterState, UsersApiFilters } from "../types";
import { UsersActiveFilters } from "./users-active-filters";
import { UsersFilterControls } from "./users-filter-controls";
import { ChangePasswordModal } from "./change-password-modal";
import { EditUserModal, type EditUserFormData } from "./edit-user-modal";

export default function UsersPage() {
    const [users, setUsers] = useState<BaseUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<UsersFilterState>({
        search: "",
        role: "ALL",
        active: "ALL"
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [changePasswordModal, setChangePasswordModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({
        isOpen: false,
        user: null
    });
    const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: BaseUser | null }>({
        isOpen: false,
        user: null
    });
    const [isModalLoading, setIsModalLoading] = useState(false);
    const { toast } = useToast();

    // Função para carregar usuários com filtros
    const loadUsers = useCallback((currentFilters: UsersFilterState) => {
        setIsLoading(true);

        // Converter filtros do frontend para o formato da API
        const apiFilters: UsersApiFilters = {};

        if (currentFilters.search && currentFilters.search.trim()) {
            apiFilters.search = currentFilters.search.trim();
        }

        if (currentFilters.role !== "ALL") {
            apiFilters.role = currentFilters.role;
        }

        if (currentFilters.active !== "ALL") {
            apiFilters.active = currentFilters.active === "true";
        }

        usersApi.list(Object.keys(apiFilters).length > 0 ? apiFilters : undefined)
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
    }, []);

    useEffect(() => {
        loadUsers({
            search: "",
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
        loadUsers(newFilters); // Pesquisa imediatamente quando remove filtro
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.role !== "ALL") count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

    const handleClearFilters = () => {
        setFilters({
            search: "",
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

    const handlePasswordSubmit = async (password: string) => {
        if (!changePasswordModal.user) return;

        setIsModalLoading(true);
        try {
            await usersApi.changePassword(changePasswordModal.user.id, password);
            console.log('Changing password for user:', changePasswordModal.user.id, 'New password:', password);

            toast.success("Senha alterada", {
                description: `Senha do usuário ${changePasswordModal.user.name} foi alterada com sucesso.`
            });

            setChangePasswordModal({ isOpen: false, user: null });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao alterar senha", {
                description: errorMessage
            });
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleUserEdit = async (userData: EditUserFormData) => {
        if (!editUserModal.user) return;

        setIsModalLoading(true);
        try {
            await usersApi.update(editUserModal.user.id, userData);

            toast.success("Usuário atualizado", {
                description: `Dados do usuário ${userData.name} foram atualizados com sucesso.`
            });

            setEditUserModal({ isOpen: false, user: null });
            loadUsers(filters);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao atualizar usuário", {
                description: errorMessage
            });
        } finally {
            setIsModalLoading(false);
        }
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
        </>
    )

    const getUsersList = () => {
        return (
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
                    columns={[
                        {
                            id: 'name',
                            header: 'Nome',
                            accessorKey: 'name',
                            cell: ({ row }) => (
                                <Link to={`/usuarios/${row.id}`} className="text-blue-600 hover:underline">
                                    {row.original.name}
                                </Link>
                            ),
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
                            cell: ({ row }) => (
                                getRoleLabel(row.original.role)
                            )
                        },
                        {
                            id: 'active',
                            header: 'Ativo',
                            accessorKey: 'active',
                            cell: ({ row }) => (
                                row.original.active ? 'Sim' : 'Não'
                            )
                        },
                        {
                            id: 'createdAt',
                            header: 'Criado em',
                            accessorKey: 'createdAt',
                            cell: ({ row }) => (
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
                            cell: ({ row }) => (
                                getActionButtons(row.original)
                            )
                        }
                    ]}
                    data={users}
                    isLoading={isLoading}
                />
            </PageCard>
        )
    }

    const breadcrumbs = [
        { label: "Dashboard", to: "/" },
        { label: "Usuários" }
    ];

    const newUserButton = (
        <Button variant="default" size="sm" className="flex items-center gap-2">
            <Plus size={16} />
            Novo Usuário
        </Button>
    )

    return (
        <PageContainer
            title="Usuários"
            breadcrumbs={breadcrumbs}
            extra={newUserButton}
        >
            {getUsersList()}

            <ChangePasswordModal
                isOpen={changePasswordModal.isOpen}
                onClose={() => setChangePasswordModal({ isOpen: false, user: null })}
                onSubmit={handlePasswordSubmit}
                user={changePasswordModal.user}
                isLoading={isModalLoading}
            />

            <EditUserModal
                isOpen={editUserModal.isOpen}
                onClose={() => setEditUserModal({ isOpen: false, user: null })}
                onSubmit={handleUserEdit}
                user={editUserModal.user}
                isLoading={isModalLoading}
            />
        </PageContainer>
    );
}
