import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Settings, TestTube, Trash2, Eye } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useEffect, useState, useCallback } from "react";
import { notificationChannelsApi } from "@/controllers/notification-channels-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/custom-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { NotificationChannelData } from "@/types/notification-channel";
import type { NotificationChannelFilterState, NotificationChannelApiFilters } from "../types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedWrapper } from "@/components/animated-wrapper";

export default function ChannelsList() {
    const [channels, setChannels] = useState<NotificationChannelData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; channel: NotificationChannelData | null }>({ isOpen: false, channel: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Funções para navegação
    const handleCreateChannel = () => navigate('/canais-notificacao/novo');
    const handleEditChannel = (channel: NotificationChannelData) => navigate(`/canais-notificacao/${channel.id}/editar`);
    const handleViewChannel = (channel: NotificationChannelData) => navigate(`/canais-notificacao/${channel.id}`);
    const handleDeleteChannel = (channel: NotificationChannelData) => setDeleteModal({ isOpen: true, channel });

    const [filters] = useState<NotificationChannelFilterState>({
        search: "",
        type: "ALL",
        active: "ALL"
    });

    const { toast } = useToast();

    const loadChannels = useCallback(() => {
        setIsLoading(true);

        const apiFilters: NotificationChannelApiFilters = {};

        if (filters.search && filters.search.trim()) {
            apiFilters.search = filters.search.trim();
        }

        if (filters.type !== "ALL") {
            apiFilters.type = filters.type;
        }

        if (filters.active !== "ALL") {
            apiFilters.active = filters.active === "true";
        }

        notificationChannelsApi.list(apiFilters)
            .then((data) => {
                setChannels(data);
            })
            .catch((error) => {
                toast.error("Erro ao carregar canais", {
                    description: error?.message || "Não foi possível carregar a lista de canais."
                });
                setChannels([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [filters, toast]);

    useEffect(() => {
        loadChannels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getChannelTypeLabel = (type: string) => {
        switch (type) {
            case "TELEGRAM": return "Telegram";
            case "EMAIL": return "Email";
            case "WEBHOOK": return "Webhook";
            default: return type;
        }
    };

    const getActiveStatus = (active: boolean) => {
        return active ? (
            <Badge className="bg-green-500/20 text-green-500">Ativo</Badge>
        ) : (
            <Badge className="bg-red-500/20 text-red-500">Inativo</Badge>
        );
    };

    const handleTest = async (channel: NotificationChannelData) => {
        try {
            const result = await notificationChannelsApi.test(channel.id);

            if (result.testResult.success) {
                toast.success("Teste realizado com sucesso", {
                    description: `Notificação enviada através do canal "${channel.name}"`
                });
            } else {
                // Usar o erro detalhado se disponível, senão usar a mensagem geral
                const errorMessage = result.testResult.details?.error || result.testResult.message;
                toast.error("Erro no teste", {
                    description: errorMessage
                });
            }
        } catch {
            toast.error("Erro ao testar canal", {
                description: "Não foi possível realizar o teste do canal."
            });
        }
    };

    const confirmDeleteChannel = async () => {
        if (!deleteModal.channel) return;

        setIsDeleting(true);
        try {
            await notificationChannelsApi.delete(deleteModal.channel.id);
            toast.success("Canal excluído com sucesso", {
                description: `O canal "${deleteModal.channel.name}" foi removido.`
            });
            loadChannels(); // Recarregar a lista
        } catch (error) {
            toast.error("Erro ao excluir canal", {
                description: (error as Error)?.message || "Não foi possível excluir o canal."
            });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ isOpen: false, channel: null });
        }
    };

    const actionsCell = (channel: NotificationChannelData) => (
        <>
            {isAdmin(user) && (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleTest(channel)}
                            >
                                <TestTube className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Testar canal</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleViewChannel(channel)}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Ver detalhes</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleEditChannel(channel)}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar canal</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-destructive hover:text-destructive"
                                onClick={() => handleDeleteChannel(channel)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Excluir canal</p>
                        </TooltipContent>
                    </Tooltip>
                </>
            )}
        </>
    );

    const columns: ColumnDef<NotificationChannelData>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {getChannelTypeLabel(row.getValue("type"))}
                </Badge>
            ),
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => getActiveStatus(row.getValue("active")),
        },
        {
            accessorKey: "created_at",
            header: "Criado em",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return date.toLocaleDateString('pt-BR');
            },
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => actionsCell(row.original),
        },
    ];

    const breadcrumbs = [
        { label: "Dashboard", to: "/" },
        { label: "Canais de Notificação", to: "/notification-channels" },
    ];

    const newChannelButton = isAdmin(user) ? (
        <Button onClick={handleCreateChannel} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Canal
        </Button>
    ) : null;

    return (
        <>
            <PageContainer
                title="Canais de Notificação"
                subtitle="Gerencie os canais de notificação do sistema"
                breadcrumbs={breadcrumbs}
                extra={newChannelButton}
            >
                <AnimatedWrapper preset="fadeInUp" duration={0.3}>
                    <PageCard cardTitle="Lista de Canais">
                        <DataTable
                            data={channels}
                            columns={columns}
                            isLoading={isLoading}
                            showPagination
                        />
                    </PageCard>
                </AnimatedWrapper>
            </PageContainer>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ isOpen: open, channel: deleteModal.channel })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o canal "{deleteModal.channel?.name}"?
                            Esta ação não pode ser desfeita e o canal será removido permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal({ isOpen: false, channel: null })}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteChannel}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Excluindo...
                                </>
                            ) : (
                                "Excluir Canal"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}


