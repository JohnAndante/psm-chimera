import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { integrationAPI } from "@/controllers/integration-api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import type { CreateIntegrationRequest, IntegrationType, RPConfig, CresceVendasConfig } from "@/types/integration";
import { INTEGRATION_TYPES } from "@/types/integration";

export default function CreateIntegrationPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: '' as IntegrationType,
        active: true,
        config: {} as RPConfig | CresceVendasConfig
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type) {
            toast.error('Erro de validação', {
                description: 'Nome e tipo são obrigatórios'
            });
            return;
        }

        setIsLoading(true);
        try {
            const request: CreateIntegrationRequest = {
                name: formData.name,
                type: formData.type,
                config: formData.config,
                active: formData.active
            };

            await integrationAPI.createIntegration(request);
            toast.success('Integração criada com sucesso');
            navigate('/integracoes');
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao criar integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeChange = (type: IntegrationType) => {
        setFormData(prev => ({
            ...prev,
            type,
            config: type === INTEGRATION_TYPES.RP ? {
                base_url: '',
                token: '',
                username: '',
                password: ''
            } : {
                base_url: '',
                api_key: ''
            }
        }));
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
        if (!formData.type) return null;

        if (formData.type === INTEGRATION_TYPES.RP) {
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

        if (formData.type === INTEGRATION_TYPES.CRESCEVENDAS) {
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

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Nova Integração"
                subtitle="Criar uma nova integração com sistema externo"
                breadcrumbs={[
                    { label: 'Integrações', to: '/integracoes' },
                    { label: 'Nova Integração' }
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
                                    <Label htmlFor="type">Tipo de Integração *</Label>
                                    <Select value={formData.type} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={INTEGRATION_TYPES.RP}>RP</SelectItem>
                                            <SelectItem value={INTEGRATION_TYPES.CRESCEVENDAS}>CresceVendas</SelectItem>
                                        </SelectContent>
                                    </Select>
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
