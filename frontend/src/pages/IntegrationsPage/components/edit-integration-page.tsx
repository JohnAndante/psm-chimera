import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { IntegrationController } from "@/controllers/integration.controller";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import type { Integration, UpdateIntegrationRequest, RPConfig, CresceVendasConfig } from "@/types/integration";
import { INTEGRATION_TYPES } from "@/types/integration";

export default function EditIntegrationPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [integration, setIntegration] = useState<Integration | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        active: true,
        config: {} as RPConfig | CresceVendasConfig
    });

    useEffect(() => {
        if (!id) {
            navigate('/integracoes');
            return;
        }

        const loadIntegration = async () => {
            try {
                const data = await IntegrationController.getIntegrationById(parseInt(id));
                setIntegration(data);
                setFormData({
                    name: data.name,
                    active: data.active,
                    config: data.config
                });
            } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
                toast.error('Erro ao carregar integração', {
                    description: error.message || 'Ocorreu um erro inesperado'
                });
                navigate('/integracoes');
            } finally {
                setIsLoadingData(false);
            }
        };

        loadIntegration();
    }, [id, navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Erro de validação', {
                description: 'Nome é obrigatório'
            });
            return;
        }

        if (!integration) return;

        setIsLoading(true);
        try {
            const request: UpdateIntegrationRequest = {
                name: formData.name,
                config: formData.config,
                active: formData.active
            };

            await IntegrationController.updateIntegration(integration.id, request);
            toast.success('Integração atualizada com sucesso');
            navigate('/integracoes');
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao atualizar integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateConfig = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                [field]: value
            }
        }));
    };

    const renderConfigFields = () => {
        if (!integration) return null;

        if (integration.type === INTEGRATION_TYPES.RP) {
            const config = formData.config as RPConfig;
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="base_url">URL Base *</Label>
                        <Input
                            id="base_url"
                            value={config.base_url || ''}
                            onChange={(e) => updateConfig('base_url', e.target.value)}
                            placeholder="https://api.rp.com"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="token">Token *</Label>
                        <Input
                            id="token"
                            type="password"
                            value={config.token || ''}
                            onChange={(e) => updateConfig('token', e.target.value)}
                            placeholder="Token de acesso"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="username">Usuário</Label>
                        <Input
                            id="username"
                            value={config.username || ''}
                            onChange={(e) => updateConfig('username', e.target.value)}
                            placeholder="Nome do usuário"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={config.password || ''}
                            onChange={(e) => updateConfig('password', e.target.value)}
                            placeholder="Senha"
                        />
                    </div>
                </div>
            );
        }

        if (integration.type === INTEGRATION_TYPES.CRESCEVENDAS) {
            const config = formData.config as CresceVendasConfig;
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="base_url">URL Base *</Label>
                        <Input
                            id="base_url"
                            value={config.base_url || ''}
                            onChange={(e) => updateConfig('base_url', e.target.value)}
                            placeholder="https://api.crescevendas.com"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="api_key">API Key *</Label>
                        <Input
                            id="api_key"
                            type="password"
                            value={config.api_key || ''}
                            onChange={(e) => updateConfig('api_key', e.target.value)}
                            placeholder="Chave da API"
                            required
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    if (isLoadingData) {
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
                title={`Editar ${integration.name}`}
                subtitle="Editar configurações da integração"
                breadcrumbs={[
                    { label: 'Integrações', to: '/integracoes' },
                    { label: integration.name, to: `/integracoes/${integration.id}` },
                    { label: 'Editar' }
                ]}
                extra={
                    <Button variant="outline" onClick={() => navigate('/integracoes')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                }
            >
                <PageCard>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nome da Integração *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Ex: RP Production"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Tipo de Integração</Label>
                                    <div className="p-2 bg-muted rounded">
                                        {integration.type}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        O tipo não pode ser alterado após a criação
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={formData.active}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                                    />
                                    <Label htmlFor="active">Integração ativa</Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Configurações</h3>
                                {renderConfigFields()}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/integracoes')}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                <Save className="mr-2 h-4 w-4" />
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </PageCard>
            </PageContainer>
        </AnimatedWrapper>
    );
}
