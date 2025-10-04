import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SyncController } from "@/controllers/sync.controller";
import { IntegrationController } from "@/controllers/integration.controller";
import { storeApi } from "@/controllers/store-api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import type { CreateSyncConfigRequest, Integration, Store } from "@/types";

export default function CreateSyncConfigPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        source_integration_id: 0,
        target_integration_id: 0,
        notification_channel_id: undefined as number | undefined,
        store_ids: [] as number[],
        schedule_enabled: false,
        schedule_cron: '',
        options: {
            force_sync: false,
            skip_comparison: false,
            batch_size: 100,
            timeout_minutes: 30
        }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [integrationsData, storesData] = await Promise.all([
                    IntegrationController.getAllIntegrations(),
                    storeApi.list({ active: true })
                ]);

                setIntegrations(integrationsData.filter(i => i.active));
                setStores(storesData);
            } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
                toast.error('Erro ao carregar dados', {
                    description: error.message || 'Ocorreu um erro inesperado'
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.source_integration_id || !formData.target_integration_id) {
            toast.error('Erro de validação', {
                description: 'Nome, integração de origem e destino são obrigatórios'
            });
            return;
        }

        if (formData.store_ids.length === 0) {
            toast.error('Erro de validação', {
                description: 'Selecione pelo menos uma loja'
            });
            return;
        }

        if (formData.source_integration_id === formData.target_integration_id) {
            toast.error('Erro de validação', {
                description: 'Integração de origem e destino devem ser diferentes'
            });
            return;
        }

        setIsLoading(true);
        try {
            const request: CreateSyncConfigRequest = {
                name: formData.name,
                description: formData.description || undefined,
                source_integration_id: formData.source_integration_id,
                target_integration_id: formData.target_integration_id,
                notification_channel_id: formData.notification_channel_id,
                store_ids: formData.store_ids,
                schedule_enabled: formData.schedule_enabled,
                schedule_cron: formData.schedule_cron || undefined,
                options: formData.options
            };

            await SyncController.createSyncConfig(request);
            toast.success('Configuração criada com sucesso');
            navigate('/sincronizacoes');
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao criar configuração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStoreToggle = (storeId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            store_ids: checked
                ? [...prev.store_ids, storeId]
                : prev.store_ids.filter(id => id !== storeId)
        }));
    };

    const handleSelectAllStores = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            store_ids: checked ? stores.map(store => store.id) : []
        }));
    };

    if (isLoadingData) {
        return (
            <AnimatedWrapper>
                <PageContainer title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
                    <PageCard>
                        <div className="flex justify-center items-center h-32">
                            <div className="text-lg">Carregando dados...</div>
                        </div>
                    </PageCard>
                </PageContainer>
            </AnimatedWrapper>
        );
    }

    const rpIntegrations = integrations.filter(i => i.type === 'RP');
    const cresceVendasIntegrations = integrations.filter(i => i.type === 'CRESCEVENDAS');

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Nova Configuração de Sincronização"
                subtitle="Criar uma nova configuração de sincronização"
                breadcrumbs={[
                    { label: 'Sincronizações', to: '/sincronizacoes' },
                    { label: 'Nova Configuração' }
                ]}
                extra={
                    <Button variant="outline" onClick={() => navigate('/sincronizacoes')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <PageCard cardTitle="Informações Gerais">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Nome da Configuração *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Sync RP -> CresceVendas"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descrição opcional da configuração"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Integrações">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="source_integration">Integração de Origem (RP) *</Label>
                                <Select
                                    value={formData.source_integration_id?.toString() || ""}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, source_integration_id: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a integração RP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rpIntegrations.map(integration => (
                                            <SelectItem key={integration.id} value={integration.id.toString()}>
                                                {integration.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="target_integration">Integração de Destino (CresceVendas) *</Label>
                                <Select
                                    value={formData.target_integration_id?.toString() || ""}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, target_integration_id: parseInt(value) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a integração CresceVendas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cresceVendasIntegrations.map(integration => (
                                            <SelectItem key={integration.id} value={integration.id.toString()}>
                                                {integration.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Lojas">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all-stores"
                                    checked={formData.store_ids.length === stores.length && stores.length > 0}
                                    onCheckedChange={handleSelectAllStores}
                                />
                                <Label htmlFor="select-all-stores" className="font-medium">
                                    Selecionar todas as lojas ({stores.length})
                                </Label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                                {stores.map(store => (
                                    <div key={store.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`store-${store.id}`}
                                            checked={formData.store_ids.includes(store.id)}
                                            onCheckedChange={(checked) => handleStoreToggle(store.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`store-${store.id}`} className="text-sm">
                                            {store.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>

                            {formData.store_ids.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    {formData.store_ids.length} loja(s) selecionada(s)
                                </div>
                            )}
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Agendamento">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="schedule-enabled"
                                    checked={formData.schedule_enabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, schedule_enabled: checked }))}
                                />
                                <Label htmlFor="schedule-enabled">Habilitar agendamento automático</Label>
                            </div>

                            {formData.schedule_enabled && (
                                <div>
                                    <Label htmlFor="schedule-cron">Expressão Cron</Label>
                                    <Input
                                        id="schedule-cron"
                                        value={formData.schedule_cron}
                                        onChange={(e) => setFormData(prev => ({ ...prev, schedule_cron: e.target.value }))}
                                        placeholder="0 5,17 * * * (5h e 17h todos os dias)"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Formato: segundo minuto hora dia mês dia_da_semana
                                    </p>
                                </div>
                            )}
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Opções Avançadas">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="force-sync"
                                        checked={formData.options.force_sync}
                                        onCheckedChange={(checked) => setFormData(prev => ({
                                            ...prev,
                                            options: { ...prev.options, force_sync: checked as boolean }
                                        }))}
                                    />
                                    <Label htmlFor="force-sync">Forçar sincronização</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="skip-comparison"
                                        checked={formData.options.skip_comparison}
                                        onCheckedChange={(checked) => setFormData(prev => ({
                                            ...prev,
                                            options: { ...prev.options, skip_comparison: checked as boolean }
                                        }))}
                                    />
                                    <Label htmlFor="skip-comparison">Pular comparação</Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="batch-size">Tamanho do lote</Label>
                                    <Input
                                        id="batch-size"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={formData.options.batch_size}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            options: { ...prev.options, batch_size: parseInt(e.target.value) || 100 }
                                        }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="timeout">Timeout (minutos)</Label>
                                    <Input
                                        id="timeout"
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={formData.options.timeout_minutes}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            options: { ...prev.options, timeout_minutes: parseInt(e.target.value) || 30 }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </PageCard>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/sincronizacoes')}
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
            </PageContainer>
        </AnimatedWrapper>
    );
}
