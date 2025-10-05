import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { integrationAPI } from "@/controllers/integration-api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings, TestTube, Power, PowerOff } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import type { Integration, RPConfig, CresceVendasConfig } from "@/types/integration";
import { INTEGRATION_TYPES } from "@/types/integration";
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";

export default function IntegrationDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [integration, setIntegration] = useState<Integration | null>(null);

    useEffect(() => {
        if (!id) {
            navigate('/integracoes');
            return;
        }

        const loadIntegration = async () => {
            try {
                const data = await integrationAPI.getIntegrationById(parseInt(id));
                setIntegration(data);
            } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
                toast.error('Erro ao carregar integração', {
                    description: error.message || 'Ocorreu um erro inesperado'
                });
                navigate('/integracoes');
            } finally {
                setIsLoading(false);
            }
        };

        loadIntegration();
    }, [id, navigate, toast]);

    const handleToggleActive = async () => {
        if (!integration) return;

        try {
            await integrationAPI.updateIntegration(integration.id, {
                active: !integration.active
            });

            toast.success('Integração atualizada', {
                description: `Integração ${integration.active ? 'desativada' : 'ativada'} com sucesso`
            });

            setIntegration(prev => prev ? { ...prev, active: !prev.active } : null);
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao atualizar integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    };

    const handleTestConnection = async () => {
        if (!integration) return;

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

    const renderConfigDetails = () => {
        if (!integration) return null;

        if (integration.type === INTEGRATION_TYPES.RP) {
            const config = integration.config as RPConfig;
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">URL Base</label>
                        <div className="p-2 bg-muted rounded mt-1">{config.base_url}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Token</label>
                        <div className="p-2 bg-muted rounded mt-1">***************</div>
                    </div>
                    {config.username && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                            <div className="p-2 bg-muted rounded mt-1">{config.username}</div>
                        </div>
                    )}
                    {config.password && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Senha</label>
                            <div className="p-2 bg-muted rounded mt-1">***************</div>
                        </div>
                    )}
                </div>
            );
        }

        if (integration.type === INTEGRATION_TYPES.CRESCEVENDAS) {
            const config = integration.config as CresceVendasConfig;
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">URL Base</label>
                        <div className="p-2 bg-muted rounded mt-1">{config.base_url}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">API Key</label>
                        <div className="p-2 bg-muted rounded mt-1">***************</div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <AnimatedWrapper>
                <PageContainer title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
                    <PageCard>
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg">Carregando integração...</div>
                        </div>
                    </PageCard>
                </PageContainer>
            </AnimatedWrapper>
        );
    }

    if (!integration) {
        return null;
    }

    return (
        <AnimatedWrapper>
            <PageContainer
                title={integration.name}
                subtitle="Detalhes da integração"
                breadcrumbs={[
                    { label: 'Integrações', to: '/integracoes' },
                    { label: integration.name }
                ]}
                extra={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/integracoes')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>

                        <Button variant="outline" onClick={handleTestConnection}>
                            <TestTube className="mr-2 h-4 w-4" />
                            Testar Conexão
                        </Button>

                        {isAdmin(user) && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleActive}
                                    className={integration.active ? 'text-orange-600' : 'text-green-600'}
                                >
                                    {integration.active ? (
                                        <>
                                            <PowerOff className="mr-2 h-4 w-4" />
                                            Desativar
                                        </>
                                    ) : (
                                        <>
                                            <Power className="mr-2 h-4 w-4" />
                                            Ativar
                                        </>
                                    )}
                                </Button>

                                <Button onClick={() => navigate(`/integracoes/${integration.id}/editar`)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                            </>
                        )}
                    </div>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PageCard cardTitle="Informações Gerais">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                                <div className="text-lg font-medium mt-1">{integration.name}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                <div className="mt-1">
                                    <Badge className={getIntegrationTypeColor(integration.type)}>
                                        {integration.type}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge variant={integration.active ? "default" : "secondary"}>
                                        {integration.active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                                <div className="mt-1">{new Date(integration.created_at).toLocaleString()}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                                <div className="mt-1">{new Date(integration.updated_at).toLocaleString()}</div>
                            </div>
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Configurações">
                        {renderConfigDetails()}
                    </PageCard>
                </div>
            </PageContainer>
        </AnimatedWrapper>
    );
}
