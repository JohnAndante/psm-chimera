import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageCard } from "@/components/layout/page-card";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { integrationAPI } from "@/controllers/integration-api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings, TestTube, Power, PowerOff } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import type { IntegrationWithExtras, RPConfig, CresceVendasConfig, JobConfig } from "@/types/integration";
import { INTEGRATION_TYPES } from "@/types/integration";
import { formatDateToBR } from '@/utils/string';
import { isAdmin } from "@/utils/permissions";
import { useAuth } from "@/stores/auth";
import { Label } from "@/components/ui/label";

export default function IntegrationDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isTesting, setIsTesting] = useState(false);
    const [integration, setIntegration] = useState<IntegrationWithExtras | null>(null);
    const lastRequestedIdRef = useRef<number | null>(null);

    const toastRef = useRef(toast);

    useEffect(() => {
        toastRef.current = toast;
    }, [toast]);

    useEffect(() => {
        if (!id) {
            navigate('/integracoes');
            return;
        }
        const parsedId = parseInt(id);

        // If we've already requested & cached this id, reuse it.
        if (lastRequestedIdRef.current === parsedId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        // Module-level cache + in-flight promise map to dedupe requests across
        // multiple mounts/StrictMode double-invokes.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (IntegrationDetailsPage as any)._cache = (IntegrationDetailsPage as any)._cache || new Map<number, IntegrationWithExtras | null>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (IntegrationDetailsPage as any)._inFlight = (IntegrationDetailsPage as any)._inFlight || new Map<number, Promise<IntegrationWithExtras>>();

        // If cached, use it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cache: Map<number, IntegrationWithExtras | null> = (IntegrationDetailsPage as any)._cache;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inFlightMap: Map<number, Promise<IntegrationWithExtras>> = (IntegrationDetailsPage as any)._inFlight;

        if (cache.has(parsedId)) {
            const cached = cache.get(parsedId) || null;
            setIntegration(cached);
            lastRequestedIdRef.current = parsedId;
            setIsLoading(false);
            return;
        }

        // If another instance is already fetching this id, reuse the promise
        let promise = inFlightMap.get(parsedId);

        if (!promise) {
            promise = (async () => {
                const data = await integrationAPI.getIntegrationById(parsedId);
                return data as IntegrationWithExtras;
            })();

            inFlightMap.set(parsedId, promise);
        }

        setIsLoading(true);

        promise.then((data) => {
            if (cancelled) return;
            cache.set(parsedId, data);
            setIntegration(data);
            lastRequestedIdRef.current = parsedId;
        }).catch((error) => {
            if (cancelled) return;
            // use toastRef to avoid effect dep on toast
            toastRef.current?.error('Erro ao carregar integração', {
                description: (error && error.message) ? error.message : 'Ocorreu um erro inesperado'
            });
            navigate('/integracoes');
        }).finally(() => {
            if (!cancelled) setIsLoading(false);
            inFlightMap.delete(parsedId);
        });

        return () => {
            cancelled = true;
        };
    }, [id, navigate]);

    const handleToggleActive = useCallback(async () => {
        if (!integration) return;

        try {
            await integrationAPI.updateIntegration(integration.id, {
                active: !integration.active
            });

            toast.success('Integração atualizada', {
                description: `Integração ${integration.active ? 'desativada' : 'ativada'} com sucesso`
            });

            setIntegration(prev => prev ? { ...prev, active: !prev.active } : null);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao atualizar integração', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        }
    }, [integration, toast]);

    const handleTestConnection = useCallback(async () => {
        if (!integration) return;

        setIsTesting(true);
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
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Erro ao testar conexão', {
                description: error.message || 'Ocorreu um erro inesperado'
            });
        } finally {
            setIsTesting(false);
        }
    }, [integration, toast]);

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

    const renderConfigValue = (val: unknown, key?: string, options?: { sensitive?: boolean }) => {
        const sensitive = options?.sensitive || (typeof key === 'string' && /token|key|password|secret/i.test(key));

        if (val === undefined || val === null || (typeof val === 'string' && val.toString().trim() === '')) {
            return <span className="text-sm text-muted-foreground">-</span>;
        }

        if (typeof val === 'string' && val === 'CHANGE_ME') {
            return <span className="text-yellow-600 font-medium">CHANGE_ME (pendente)</span>;
        }

        if (sensitive) {
            // show masked value if present
            return <span className="font-mono">***************</span>;
        }

        if (typeof val === 'object') {
            return <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-auto">{JSON.stringify(val, null, 2)}</pre>;
        }

        return <span className="text-sm">{String(val)}</span>;
    };

    const hasPendingConfig = (cfg: unknown): boolean => {
        if (!cfg) return false;
        const check = (x: unknown): boolean => {
            if (x === 'CHANGE_ME') return true;
            if (x && typeof x === 'object') return Object.values(x as Record<string, unknown>).some(check);
            return false;
        };
        return check(cfg);
    };

    const getAuthMethodColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'token':
                return 'bg-purple-100 text-purple-800';
            case 'login':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    const renderConfigDetails = () => {
        if (!integration) return null;
        const cfg = integration.config as Partial<RPConfig & CresceVendasConfig & { pagination?: { method?: string; param_name?: string; additional_params?: Record<string, unknown> } }>;

        if (integration.type === INTEGRATION_TYPES.RP) {
            const config = integration.config as RPConfig;
            const pending = hasPendingConfig(config);
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="base-url">URL Base</Label>
                        <div id="base-url" className="p-2 bg-muted rounded mt-1">{renderConfigValue(config.base_url)}</div>
                    </div>

                    {pending && (
                        <div className="col-span-1 lg:col-span-2 text-sm text-yellow-600">Algumas configurações estão pendentes (CHANGE_ME)</div>
                    )}

                    {cfg.auth_method && (
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Método de Auth</Label>
                            <Badge className={getAuthMethodColor(cfg.auth_method) + " mt-1"}>{renderConfigValue(cfg.auth_method)}</Badge>
                        </div>
                    )}

                    {cfg.token_header && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Token Header</label>
                            <div className="p-2 bg-muted rounded mt-1">{renderConfigValue(cfg.token_header, 'token_header', { sensitive: true })}</div>
                        </div>
                    )}

                    {cfg.login_endpoint && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Login Endpoint</label>
                            <div className="p-2 bg-muted rounded mt-1">{renderConfigValue(cfg.login_endpoint)}</div>
                        </div>
                    )}

                    {cfg.products_endpoint && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Products Endpoint</label>
                            <div className="p-2 bg-muted rounded mt-1 break-all">{renderConfigValue(cfg.products_endpoint)}</div>
                        </div>
                    )}

                    {cfg.pagination && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Paginação</label>
                            <div className="p-2 bg-muted rounded mt-1">
                                <div>Method: {renderConfigValue(cfg.pagination.method)}</div>
                                <div>Param: {renderConfigValue(cfg.pagination.param_name)}</div>
                                {cfg.pagination.additional_params && (
                                    <div className="mt-2">
                                        <div className="text-sm font-medium">Additional Params</div>
                                        <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-auto">{JSON.stringify(cfg.pagination.additional_params, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Credenciais</label>
                        <div className="p-2 bg-muted rounded mt-1 flex flex-col">
                            <div>
                                <span className="text-sm font-medium">Usuário: </span>{renderConfigValue(config.username, 'username')}
                            </div>
                            <div>
                                <span className="text-sm font-medium">Senha: </span>{renderConfigValue(config.password, 'password', { sensitive: true })}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (integration.type === INTEGRATION_TYPES.CRESCEVENDAS) {
            const config = integration.config as CresceVendasConfig;
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">URL Base</label>
                        <div className="p-2 bg-muted rounded mt-1">{renderConfigValue(config.base_url)}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">API Key</label>
                        <div className="p-2 bg-muted rounded mt-1">{renderConfigValue(config.api_key, 'api_key', { sensitive: true })}</div>
                    </div>

                    {config.auth_headers && Object.keys(config.auth_headers).length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2">Auth Headers</label>
                            <div className="space-y-2 mt-2">
                                {Object.entries(config.auth_headers).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                                        <span className="font-mono text-sm font-medium">{key}</span>
                                        <span className="font-mono text-sm text-muted-foreground">{renderConfigValue(value, key, { sensitive: /token|password|key/i.test(key) })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {config.campaign_config && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Campaign Config</label>
                            <div className="p-2 bg-muted rounded mt-1">
                                <div className="text-sm">Name: {renderConfigValue(config.campaign_config.name)}</div>
                                <div className="text-sm">Start: {renderConfigValue(config.campaign_config.start_time)}</div>
                                <div className="text-sm">End: {renderConfigValue(config.campaign_config.end_time)}</div>
                                <div className="text-sm">Override: {config.campaign_config.override_existing ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    )}

                    {config.get_products_endpoint && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Get Products Endpoint</label>
                            <div className="p-2 bg-muted rounded mt-1 break-all">{renderConfigValue(config.get_products_endpoint)}</div>
                        </div>
                    )}

                    {config.send_products_endpoint && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Send Products Endpoint</label>
                            <div className="p-2 bg-muted rounded mt-1 break-all">{renderConfigValue(config.send_products_endpoint)}</div>
                        </div>
                    )}
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
            >
                <div className="grid grid-cols-1 gap-4">
                    <PageCard cardTitle="Informações Gerais">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <div className="mt-1">{integration.created_at ? formatDateToBR(integration.created_at) : '-'}</div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                                <div className="mt-1">{integration.updated_at ? formatDateToBR(integration.updated_at) : '-'}</div>
                            </div>
                        </div>
                    </PageCard>

                    <PageCard cardTitle="Configurações">
                        {renderConfigDetails()}
                    </PageCard>
                </div>

                <div className="mt-6">
                    <PageCard cardTitle="Jobs & Chaves">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Job Configs</label>
                                <div className="mt-2 space-y-2">
                                    {integration.job_configs && integration.job_configs.length > 0 ? (
                                        integration.job_configs.map((job: JobConfig) => (
                                            <div key={job.id} className="p-2 bg-muted rounded">
                                                <div className="font-medium">{job.name}</div>
                                                <div className="text-sm">Cron: {job.cron_pattern}</div>
                                                <div className="text-sm">Ativo: {job.active ? 'Sim' : 'Não'}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Nenhum job configurado</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Integration Keys</label>
                                <div className="mt-2">
                                    {integration.integrationKey && integration.integrationKey.length > 0 ? (
                                        <pre className="bg-muted p-2 rounded text-sm">{JSON.stringify(integration.integrationKey, null, 2)}</pre>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">Nenhuma chave registrada</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </PageCard>
                </div>
            </PageContainer>

            <AnimatedWrapper preset="fadeIn" duration={0.3}>
                <div className="fixed bottom-6 right-6 z-50 flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => navigate('/integracoes')}
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-shadow bg-card"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                    >
                        {isTesting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                                Testando...
                            </>
                        ) : (
                            <>
                                <TestTube className="h-5 w-5 mr-2" />
                                Testar
                            </>
                        )}
                    </Button>

                    {isAdmin(user) && (
                        <>
                            <Button
                                type="button"
                                variant="default"
                                size="lg"
                                className="shadow-lg hover:shadow-xl transition-shadow"
                                onClick={handleToggleActive}
                            >
                                {integration.active ? (
                                    <>
                                        <PowerOff className="h-5 w-5 mr-2" />
                                        Desativar
                                    </>
                                ) : (
                                    <>
                                        <Power className="h-5 w-5 mr-2" />
                                        Ativar
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                size="lg"
                                className="shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => navigate(`/integracoes/${integration.id}/editar`)}
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Editar
                            </Button>
                        </>
                    )}
                </div>
            </AnimatedWrapper>
        </AnimatedWrapper>
    );
}
