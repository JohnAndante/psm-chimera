import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Link2, Plus, Settings, TestTube, Trash2, Eye } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { IntegrationController } from "@/controllers/integration.controller";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { Integration } from "@/types/integration";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedWrapper } from "@/components/animated-wrapper";

export default function IntegrationsList() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; integration: Integration | null }>({ isOpen: false, integration: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Funções para navegação
    const handleCreateIntegration = () => navigate('/integracoes/novo');
    const handleEditIntegration = (integration: Integration) => navigate(`/integracoes/${integration.id}/editar`);
    const handleViewIntegration = (integration: Integration) => navigate(`/integracoes/${integration.id}`);
    const handleDeleteIntegration = (integration: Integration) => setDeleteModal({ isOpen: true, integration });

    const { toast } = useToast();

    const loadIntegrations = useCallback(() => {
        setIsLoading(true);

        IntegrationController.getAllIntegrations()
            .then((data) => {
                setIntegrations(data);
            })
            .catch((error) => {
                console.error('Erro ao carregar integrações:', error);
                toast.error('Erro ao carregar integrações', {
                    description: error.message || 'Ocorreu um erro inesperado'
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [toast]);

    useEffect(() => {
        loadIntegrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleActive = async (integration: Integration) => {
        try {
            await IntegrationController.updateIntegration(integration.id, {
                active: !integration.active
            });

            toast.success('Integração atualizada', {
                description: `Integração ${integration.active ? 'desativada' : 'ativada'} com sucesso`
            });

            loadIntegrations();
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao atualizar integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    };

    const handleTestConnection = async (integration: Integration) => {
        try {
            const result = await IntegrationController.testConnection(integration.id);
            if (result.success) {
                toast.success('Conexão bem-sucedida!', {
                    description: result.message
                });
            } else {
                toast.error('Falha na conexão', {
                    description: result.message
                });
            }
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao testar conexão', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.integration) return;

        setIsDeleting(true);
        try {
            await IntegrationController.deleteIntegration(deleteModal.integration.id);
            toast.success('Integração excluída com sucesso');
            setDeleteModal({ isOpen: false, integration: null });
            loadIntegrations();
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao excluir integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getIntegrationTypeColor = (type: string) => {
        switch (type) {
            case 'RP':
                return 'bg-blue-100 text-blue-800';
            case 'CRESCEVENDAS':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const columns: ColumnDef<Integration>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                const integration = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">
                                Criado em {new Date(integration.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const integration = row.original;
                return (
                    <Badge className={getIntegrationTypeColor(integration.type)}>
                        {integration.type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => {
                const integration = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant={integration.active ? "default" : "secondary"}>
                            {integration.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(integration)}
                            className="h-6 w-6 p-0"
                        >
                            {integration.active ? "🟢" : "🔴"}
                        </Button>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => {
                const integration = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewIntegration(integration)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleTestConnection(integration)}
                                    className="h-8 w-8 p-0"
                                >
                                    <TestTube className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Testar Conexão</TooltipContent>
                        </Tooltip>

                        {isAdmin(user) && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditIntegration(integration)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Settings className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteIntegration(integration)}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Integrações"
                subtitle="Gerencie as integrações com sistemas externos"
                extra={
                    isAdmin(user) ? (
                        <Button onClick={handleCreateIntegration}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Integração
                        </Button>
                    ) : undefined
                }
            >
                <PageCard>
                    <DataTable
                        data={integrations}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </PageCard>

                {/* Modal de confirmação para exclusão */}
                <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, integration: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Exclusão</DialogTitle>
                            <DialogDescription>
                                Tem certeza que deseja excluir a integração "{deleteModal.integration?.name}"?
                                Esta ação não pode ser desfeita.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteModal({ isOpen: false, integration: null })}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Excluindo..." : "Excluir"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PageContainer>
        </AnimatedWrapper>
    );
}
