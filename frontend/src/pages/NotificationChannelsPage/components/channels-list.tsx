import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Plus, Settings, TestTube, Trash2, Eye, Loader2 } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { useState, useCallback, useMemo } from "react";
import { notificationChannelsApi } from "@/controllers/notification-channels-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/custom-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import { useNavigate } from "react-router-dom";
import { useTableData } from "@/hooks/use-table-data";
import { FilterControls, FilterFields } from "@/components/data-table";
import { DeleteChannelModal } from "./delete-channel-modal";
import { ChannelListFilterFields } from "./channel-list-filter-fields";
import { formatDateToBR } from "@/utils/string";
import type { NotificationChannelData } from "@/types/notification-channel";
import type { NotificationChannelFilterState } from "@/pages/NotificationChannelsPage/types";
import type { FilterConfig } from "@/types/filter-api";

export function NotificationChannelsList() {
    const defaultFilters: NotificationChannelFilterState = {
        name: "",
        type: "ALL",
        active: "ALL"
    };

    const [filters, setFilters] = useState<NotificationChannelFilterState>(defaultFilters);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; channel: NotificationChannelData | null }>({ isOpen: false, channel: null });
    const [isTesting, setIsTesting] = useState({ channelId: null as number | null, loading: false });

    const { user } = useAuth();
    const navigate = useNavigate();

    // Funções para navegação
    const handleCreateChannel = () => navigate('/canais-notificacao/novo');
    const handleEditChannel = useCallback((channel: NotificationChannelData) => navigate(`/canais-notificacao/${channel.id}/editar`), [navigate]);
    const handleViewChannel = useCallback((channel: NotificationChannelData) => navigate(`/canais-notificacao/${channel.id}`), [navigate]);
    const handleDeleteChannel = (channel: NotificationChannelData) => setDeleteModal({ isOpen: true, channel });

    const { toast } = useToast();

    const filterConfig = useMemo<FilterConfig>(() => {
        const config: FilterConfig = {};

        // Construir filtros aninhados seguindo o formato FilterConfig.filter
        if (filters.name && filters.name.trim()) {
            if (!config.filter) config.filter = {};
            config.filter.name = { ilike: filters.name.trim() };
        }

        if (filters.type !== "ALL") {
            if (!config.filter) config.filter = {};
            config.filter.type = { eq: filters.type };
        }

        if (filters.active !== "ALL") {
            if (!config.filter) config.filter = {};
            config.filter.active = { eq: filters.active === "true" };
        }

        return config;
    }, [filters.name, filters.type, filters.active]);

    const {
        data: channels,
        isLoading,
        pagination,
        metadata,
        sorting,
        handlePaginationChange,
        handleSortingChange,
        refetch
    } = useTableData<NotificationChannelData>({
        fetchFn: async (config) => {
            const response = await notificationChannelsApi.list(config);
            return {
                data: response.data ?? [],
                metadata: response.metadata!
            };
        },
        initialFilters: filterConfig,
        onError: (error) => {
            toast.error("Erro ao carregar canais", {
                description: error.message || 'Erro desconhecido'
            });
        }
    });

    const handleApplyFilters = useCallback((newFilters: NotificationChannelFilterState) => {
        setFilters(newFilters);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(defaultFilters);
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

    const handleTest = useCallback(async (channel: NotificationChannelData) => {
        try {
            setIsTesting({ channelId: channel.id, loading: true });
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
        } finally {
            setIsTesting({ channelId: null, loading: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleModalSuccess = useCallback(() => {
        refetch();
    }, [refetch]);


    const getActionButtons = useCallback((channel: NotificationChannelData) => (
        <>
            {isAdmin(user) && (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer hover:text-green-500"
                                disabled={isTesting.loading && isTesting.channelId === channel.id}
                                onClick={() => handleTest(channel)}
                            >
                                {isTesting.loading && isTesting.channelId === channel.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <TestTube className="h-4 w-4" />
                                )}
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
                                className="cursor-pointer hover:text-blue-500"
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
                                className="cursor-pointer hover:text-blue-500"
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
                                className="cursor-pointer text-destructive hover:text-red-500"
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
    ), [handleEditChannel, handleTest, handleViewChannel, isTesting, user]);

    type CellProps = { row: { original: NotificationChannelData } };

    const tableColumns = useMemo(() => [
        {
            id: "name",
            header: "Nome",
            accessorKey: "name",
            enableSorting: true,
        },
        {
            id: "type",
            header: "Tipo",
            accessorKey: "type",
            cell: ({ row }: CellProps) => (
                <Badge variant="outline">
                    {getChannelTypeLabel(row.original.type)}
                </Badge>
            ),
        },
        {
            id: "active",
            header: "Status",
            accessorKey: "active",
            cell: ({ row }) => getActiveStatus(row.original.active),
        },
        {
            id: "created_at",
            header: "Criado em",
            accessorKey: "created_at",
            cell: ({ row }) => formatDateToBR(row.original.createdAt),
        },
        {
            id: "actions",
            header: "Ações",
            accessorKey: "actions",
            cell: ({ row }) => getActionButtons(row.original),
        },
    ], [getActionButtons]); // Recalcular apenas se o usuário mudar

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
        <PageContainer
            title="Canais de Notificação"
            subtitle="Gerencie os canais de notificação do sistema"
            breadcrumbs={breadcrumbs}
            extra={newChannelButton}
        >
            <PageCard
                cardTitle="Lista de Canais"
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
                    filterFields={<ChannelListFilterFields isLoading={isLoading} />}
                />

                <DataTable
                    columns={tableColumns}
                    data={channels}
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

            <DeleteChannelModal
                isOpen={deleteModal.isOpen}
                channel={deleteModal.channel}
                onClose={() => setDeleteModal({ isOpen: false, channel: null })}
                onSuccess={handleModalSuccess}
            />

        </PageContainer>
    );
}


