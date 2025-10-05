import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Settings, Play, Eye, Trash2, Pause } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { SyncController } from "@/controllers/sync.controller";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/custom-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { SyncConfiguration, SyncExecution, SyncStatus } from "@/types/sync";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedWrapper } from "@/components/animated-wrapper";

export default function SyncList() {
    const [configs, setConfigs] = useState<SyncConfiguration[]>([]);
    const [executions, setExecutions] = useState<SyncExecution[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'configurations' | 'executions'>('configurations');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; config: SyncConfiguration | null }>({ isOpen: false, config: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Funções para navegação
    const handleCreateConfig = () => navigate('/sincronizacoes/novo');
    const handleEditConfig = (config: SyncConfiguration) => navigate(`/sincronizacoes/${config.id}/editar`);
    const handleViewConfig = (config: SyncConfiguration) => navigate(`/sincronizacoes/${config.id}`);
    const handleDeleteConfig = (config: SyncConfiguration) => setDeleteModal({ isOpen: true, config });
    const handleViewExecution = (execution: SyncExecution) => navigate(`/sincronizacoes/execucoes/${execution.id}`);

    const { toast } = useToast();

    const loadConfigs = useCallback(async () => {
        try {
            const data = await SyncController.getAllSyncConfigs();
            setConfigs(Array.isArray(data) ? data : []);
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Erro ao carregar configurações:', error);
            setConfigs([]); // Garantir que sempre temos um array
            toast.error('Erro ao carregar configurações', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    }, [toast]);

    const loadExecutions = useCallback(async () => {
        try {
            const data = await SyncController.getAllSyncExecutions();
            setExecutions(Array.isArray(data) ? data : []);
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Erro ao carregar execuções:', error);
            setExecutions([]); // Garantir que sempre temos um array
            toast.error('Erro ao carregar execuções', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    }, [toast]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([loadConfigs(), loadExecutions()]);
        setIsLoading(false);
    }, [loadConfigs, loadExecutions]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExecuteConfig = async (config: SyncConfiguration) => {
        try {
            await SyncController.executeSyncConfig(config.id);
            toast.success('Sincronização iniciada!', {
                description: `Configuração "${config.name}" foi executada`
            });
            await loadExecutions();
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao executar sincronização', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    };

    const handleCancelExecution = async (execution: SyncExecution) => {
        try {
            await SyncController.cancelSyncExecution(execution.id);
            toast.success('Execução cancelada');
            await loadExecutions();
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao cancelar execução', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.config) return;

        setIsDeleting(true);
        try {
            await SyncController.deleteSyncConfig(deleteModal.config.id);
            toast.success('Configuração excluída com sucesso');
            setDeleteModal({ isOpen: false, config: null });
            loadConfigs();
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao excluir configuração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusIcon = (status: SyncStatus) => {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'running':
                return '🔄';
            case 'completed':
                return '✅';
            case 'failed':
                return '❌';
            case 'cancelled':
                return '⏸️';
            default:
                return '⏳';
        }
    };

    const getStatusColor = (status: SyncStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'running':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const configColumns: ColumnDef<SyncConfiguration>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                const config = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <div className="font-medium">{config.name}</div>
                            {config.description && (
                                <div className="text-sm text-muted-foreground">{config.description}</div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "schedule_enabled",
            header: "Agendamento",
            cell: ({ row }) => {
                const config = row.original;
                return (
                    <div className="space-y-1">
                        <Badge variant={config.schedule_enabled ? "default" : "secondary"}>
                            {config.schedule_enabled ? "Agendado" : "Manual"}
                        </Badge>
                        {config.schedule_cron && (
                            <div className="text-xs text-muted-foreground">{config.schedule_cron}</div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "store_ids",
            header: "Lojas",
            cell: ({ row }) => {
                const config = row.original;
                return <Badge variant="outline">{config.store_ids.length} lojas</Badge>;
            },
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => {
                const config = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExecuteConfig(config)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Play className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Executar Agora</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewConfig(config)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>

                        {isAdmin(user) && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditConfig(config)}
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
                                            onClick={() => handleDeleteConfig(config)}
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

    const executionColumns: ColumnDef<SyncExecution>[] = [
        {
            accessorKey: "id",
            header: "Execução",
            cell: ({ row }) => {
                const execution = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(execution.status)}</span>
                        <div>
                            <div className="font-medium">#{execution.id}</div>
                            <div className="text-sm text-muted-foreground">
                                {new Date(execution.started_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const execution = row.original;
                return (
                    <Badge className={getStatusColor(execution.status)}>
                        {execution.status.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "summary",
            header: "Resumo",
            cell: ({ row }) => {
                const execution = row.original;
                return (
                    <div className="text-sm space-y-1">
                        <div>Lojas: {execution.summary.total_stores}</div>
                        <div>Produtos: {execution.summary.products_fetched}</div>
                        <div>Enviados: {execution.summary.products_sent}</div>
                        {execution.summary.errors > 0 && (
                            <div className="text-red-600">Erros: {execution.summary.errors}</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => {
                const execution = row.original;

                return (
                    <div className="flex items-center gap-1">
                        {execution.status === 'running' && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelExecution(execution)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Pause className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancelar</TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewExecution(execution)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Eye className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Sincronizações"
                subtitle="Configure e monitore sincronizações entre sistemas"
                extra={
                    isAdmin(user) ? (
                        <Button onClick={handleCreateConfig}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Configuração
                        </Button>
                    ) : undefined
                }
            >
                {/* Tabs simples */}
                <div className="space-y-6">
                    <div className="flex space-x-2 border-b">
                        <button
                            onClick={() => setActiveTab('configurations')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'configurations'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Configurações ({configs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('executions')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'executions'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Execuções ({executions?.length || 0})
                        </button>
                    </div>

                    {activeTab === 'configurations' && (
                        <PageCard>
                            <DataTable
                                data={configs}
                                columns={configColumns}
                                isLoading={isLoading}
                            />
                        </PageCard>
                    )}

                    {activeTab === 'executions' && (
                        <PageCard>
                            <DataTable
                                data={executions}
                                columns={executionColumns}
                                isLoading={isLoading}
                            />
                        </PageCard>
                    )}
                </div>

                {/* Modal de confirmação para exclusão */}
                <Dialog open={deleteModal.isOpen} modal onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, config: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Exclusão</DialogTitle>
                            <DialogDescription>
                                Tem certeza que deseja excluir a configuração "{deleteModal.config?.name}"?
                                Esta ação não pode ser desfeita e todas as execuções relacionadas serão perdidas.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteModal({ isOpen: false, config: null })}
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
