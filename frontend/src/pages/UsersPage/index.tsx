import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Eye, Plus, SquarePen } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState } from "react";
import { usersApi } from "@/controllers/users-api";
import type { BaseUser } from "@/types/user-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

export default function UsersPage() {
    const [users, setUsers] = useState<BaseUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);

        usersApi.list()
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

    const getUsersFilter = () => {
        return (
            <PageCard cardTitle="Filtros">
                <div className="text-center text-muted-foreground">
                    Filtros em construção...
                </div>
            </PageCard>
        )
    }

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

    const getUsersList = () => {
        return (
            <PageCard cardTitle="Lista de Usuários" className="mt-4">
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
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Link to={`/usuarios/${row.id}/editar`}>
                                                    <SquarePen size={16} />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Editar Usuário
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Link to={`/usuarios/${row.id}`}>
                                                    <Eye size={16} />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Ver Usuário
                                        </TooltipContent>
                                    </Tooltip>
                                </>
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
            {getUsersFilter()}
            {getUsersList()}
        </PageContainer>
    );
}
