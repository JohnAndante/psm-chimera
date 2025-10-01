import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageCard } from "@/components/layout/page-card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RefreshCw, TestTube, Settings, Zap, Trash2 } from "lucide-react";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import { createApiInstance } from "@/controllers/base-api";

// API instance
const api = createApiInstance();

interface CronStatus {
    running: boolean;
    nextExecution?: string;
}

export default function CronTestPage() {
    const [cronStatus, setCronStatus] = useState<CronStatus>({ running: false });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Verificar status do cron
    const checkCronStatus = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<{ success: boolean; status: CronStatus }>('v1/cron-test/status');
            setCronStatus(response.data.status);
        } catch {
            toast.error('Erro ao verificar status', {
                description: 'Erro ao verificar status do cron'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Iniciar teste do cron
    const startCronTest = async () => {
        try {
            setIsLoading(true);
            const response = await api.post<{ success: boolean; message: string; status: CronStatus }>('v1/cron-test/start');

            toast.success('Teste iniciado!', {
                description: response.data.message
            });

            setCronStatus(response.data.status);
        } catch {
            toast.error('Erro ao iniciar teste', {
                description: 'Não foi possível iniciar o teste do cron'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Parar teste do cron
    const stopCronTest = async () => {
        try {
            setIsLoading(true);
            const response = await api.post<{ success: boolean; message: string; status: CronStatus }>('v1/cron-test/stop');

            toast.success('Teste parado!', {
                description: response.data.message
            });

            setCronStatus(response.data.status);
        } catch {
            toast.error('Erro ao parar teste', {
                description: 'Não foi possível parar o teste do cron'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Executar teste único
    const runSingleTest = async () => {
        try {
            setIsLoading(true);
            const response = await api.post<{ success: boolean; message: string }>('v1/cron-test/run-once');

            toast.success('Teste executado!', {
                description: response.data.message
            });
        } catch {
            toast.error('Erro ao executar teste', {
                description: 'Não foi possível executar o teste único'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Criar configuração de sync de teste
    const createSyncConfig = async () => {
        try {
            setIsLoading(true);
            const response = await api.post<{ success: boolean; message: string; data: unknown }>('v1/cron-test/create-sync-config');
            toast.success('Configuração criada!', {
                description: response.data.message
            });
        } catch {
            toast.error('Erro ao criar configuração', {
                description: 'Não foi possível criar configuração de sincronização'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Executar sincronização de teste
    const runSyncTest = async () => {
        try {
            setIsLoading(true);
            const response = await api.post<{ success: boolean; message: string }>('v1/cron-test/run-sync');

            toast.success('Sincronização executada!', {
                description: response.data.message
            });
        } catch {
            toast.error('Erro ao executar sincronização', {
                description: 'Não foi possível executar sincronização de teste'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Limpar dados de teste
    const cleanupTestData = async () => {
        try {
            setIsLoading(true);
            const response = await api.delete<{ success: boolean; message: string }>('v1/cron-test/cleanup');

            toast.success('Dados limpos!', {
                description: response.data.message
            });
        } catch {
            toast.error('Erro ao limpar dados', {
                description: 'Não foi possível limpar dados de teste'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatedWrapper>
            <PageContainer
                title="Teste do Cron"
                subtitle="Testar funcionamento do sistema de agendamento"
            >
                <PageCard>
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <h3 className="font-medium">Status do Teste</h3>
                                <p className="text-sm text-muted-foreground">
                                    {cronStatus.running ? (
                                        <span className="text-green-600">🟢 Executando a cada minuto</span>
                                    ) : (
                                        <span className="text-gray-600">⚪ Parado</span>
                                    )}
                                </p>
                                {cronStatus.nextExecution && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Próxima execução: {cronStatus.nextExecution}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={checkCronStatus}
                                disabled={isLoading}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Atualizar
                            </Button>
                        </div>

                        {/* Ações */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Iniciar Teste */}
                            <Button
                                onClick={startCronTest}
                                disabled={isLoading || cronStatus.running}
                                className="h-20 flex-col"
                                variant={cronStatus.running ? "secondary" : "default"}
                            >
                                <Play className="h-6 w-6 mb-2" />
                                <span>Iniciar Teste</span>
                                <span className="text-xs">Executa a cada minuto</span>
                            </Button>

                            {/* Parar Teste */}
                            <Button
                                onClick={stopCronTest}
                                disabled={isLoading || !cronStatus.running}
                                className="h-20 flex-col"
                                variant="destructive"
                            >
                                <Square className="h-6 w-6 mb-2" />
                                <span>Parar Teste</span>
                                <span className="text-xs">Interrompe execução</span>
                            </Button>

                            {/* Teste Único */}
                            <Button
                                onClick={runSingleTest}
                                disabled={isLoading}
                                className="h-20 flex-col"
                                variant="outline"
                            >
                                <TestTube className="h-6 w-6 mb-2" />
                                <span>Teste Único</span>
                                <span className="text-xs">Executa uma vez apenas</span>
                            </Button>
                        </div>

                        {/* Testes Avançados */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Testes Avançados - Sincronização Real</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Criar Config de Sync */}
                                <Button
                                    onClick={createSyncConfig}
                                    disabled={isLoading}
                                    className="h-20 flex-col"
                                    variant="secondary"
                                >
                                    <Settings className="h-6 w-6 mb-2" />
                                    <span>Criar Config Teste</span>
                                    <span className="text-xs">Config sincronização</span>
                                </Button>

                                {/* Executar Sync */}
                                <Button
                                    onClick={runSyncTest}
                                    disabled={isLoading}
                                    className="h-20 flex-col"
                                    variant="outline"
                                >
                                    <Zap className="h-6 w-6 mb-2" />
                                    <span>Executar Sync</span>
                                    <span className="text-xs">Teste sincronização real</span>
                                </Button>

                                {/* Limpar Dados */}
                                <Button
                                    onClick={cleanupTestData}
                                    disabled={isLoading}
                                    className="h-20 flex-col"
                                    variant="destructive"
                                >
                                    <Trash2 className="h-6 w-6 mb-2" />
                                    <span>Limpar Dados</span>
                                    <span className="text-xs">Remove config teste</span>
                                </Button>
                            </div>
                        </div>

                        {/* Informações */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Como funciona</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="mb-3">
                                    <p className="font-medium">Testes Básicos:</p>
                                    <p>• <strong>Iniciar Teste:</strong> Ativa um cron job que executa a cada minuto</p>
                                    <p>• <strong>Teste Único:</strong> Executa o teste uma única vez, sem agendamento</p>
                                    <p>• <strong>Parar Teste:</strong> Interrompe a execução automática</p>
                                </div>
                                <div>
                                    <p className="font-medium">Testes Avançados:</p>
                                    <p>• <strong>Criar Config Teste:</strong> Cria uma configuração de sincronização temporária</p>
                                    <p>• <strong>Executar Sync:</strong> Executa sincronização real usando configurações do banco</p>
                                    <p>• <strong>Limpar Dados:</strong> Remove configurações de teste criadas</p>
                                </div>
                                <p className="mt-3">• Se houver canal Telegram configurado, você receberá notificações dos testes</p>
                            </div>
                        </div>

                        {/* Avisos */}
                        <div className="space-y-3">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    ✅ <strong>Canal Telegram Funcionando:</strong> Notificações sendo enviadas com sucesso! (Formatação corrigida)
                                </p>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    ℹ️ <strong>Testes Avançados:</strong> O sistema criará integrações temporárias automaticamente se necessário, permitindo testar o fluxo completo mesmo sem configurações reais.
                                </p>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Aviso:</strong> Este é um teste temporário. Lembre-se de parar o teste quando não precisar mais para evitar spam de notificações.
                                </p>
                            </div>
                        </div>
                    </div>
                </PageCard>
            </PageContainer>
        </AnimatedWrapper>
    );
}
