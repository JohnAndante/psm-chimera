import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Settings, TestTube, Eye } from "lucide-react";
import { PageCard } from "@/components/layout/page-card";
import { integrationAPI } from "@/controllers/integration-api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table/custom-table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { Integration } from "@/types/integration";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import { useTableData } from "@/hooks/use-table-data";

export default function IntegrationsList() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Funções para navegação
    const handleEditIntegration = (integration: Integration) => navigate(`/integracoes/${integration.id}/editar`);
    const handleViewIntegration = (integration: Integration) => navigate(`/integracoes/${integration.id}`);

    const { toast } = useToast();

    const fetchIntegrations = useCallback(async () => {
        const response = await integrationAPI.getAllIntegrations();
        return {
            data: response.data ?? [],
            metadata: response.metadata!
        };
    }, []);

    const {
        data: integrations,
        isLoading,
    } = useTableData<Integration>({
        fetchFn: fetchIntegrations,
        onError: (error) => {
            toast.error("Erro ao carregar integrações", {
                description: error.message || 'Erro desconhecido'
            });
        }
    });

    const handleTestConnection = async (integration: Integration) => {
        try {
            const result = await integrationAPI.testConnection(integration.id);
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

    const tableColumns: ColumnDef<Integration>[] = [
        {
            id: 'name',
            header: 'Nome',
            accessorKey: 'name',
        },
        {
            id: 'type',
            header: 'Tipo',
            accessorKey: 'type',
            cell: ({ row }) => (
                <Badge className={getIntegrationTypeColor(row.original.type)}>{row.original.type}</Badge>
            )
        },
        {
            id: 'actions',
            header: 'Ações',
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
                                    className="cursor-pointer hover:text-blue-500 transition-colors"
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
                                    className="cursor-pointer hover:text-green-500 transition-colors"
                                >
                                    <TestTube className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Testar Conexão</TooltipContent>
                        </Tooltip>

                        {isAdmin(user) && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditIntegration(integration)}
                                        className="cursor-pointer hover:text-blue-500 transition-colors"
                                    >
                                        <Settings className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Integrações"
                subtitle="Gerencie as integrações com sistemas externos"
            >
                <PageCard cardTitle="Lista de Integrações">
                    <DataTable
                        data={integrations}
                        columns={tableColumns}
                        isLoading={isLoading}
                    />
                </PageCard>
            </PageContainer>
        </AnimatedWrapper>
    );
}
