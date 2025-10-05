import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Link2, Settings, TestTube, Eye } from "lucide-react";
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

    const fetchIntegrations = useCallback(async (/* filters */) => {
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
