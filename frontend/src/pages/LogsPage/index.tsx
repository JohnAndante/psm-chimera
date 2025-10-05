import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
    RefreshCw,
    Play,
    Square,
    Download,
    Trash2,
    TestTube
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { PageCard } from '@/components/layout/page-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { LogAPIController } from '../../controllers/log.controller';
import type {
    LogEntry,
    LogFilters as LogFiltersType,
    LogStatistics,
    LogLevel
} from '../../types/log';

import { LogViewer } from './components/log-viewer';
import { LogFilters } from './components/log-filters';
import { LogStatisticsCard } from './components/log-statistic-card';
import { LogSessionList } from './components/log-session-list';

export default function LogsPage() {
    // State management
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [realTimeActive, setRealTimeActive] = useState(false);
    const [statistics, setStatistics] = useState<LogStatistics | null>(null);
    const [filters, setFilters] = useState<LogFiltersType>({
        limit: 100,
        offset: 0
    });

    const viewerConfig = {
        realTime: false,
        maxLogs: 100,
        autoScroll: true,
        showMetadata: false,
        groupBySessions: false
    };

    // Refs
    const eventSourceRef = useRef<EventSource | null>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);

    /**
     * Load logs from API
     */
    const loadLogs = useCallback(async (append = false) => {
        setLoading(true);
        try {
            const newLogs = await LogAPIController.getLogs(filters);

            if (append) {
                setLogs(prev => [...prev, ...newLogs]);
            } else {
                setLogs(newLogs);
            }

            // Auto-scroll to bottom if enabled
            if (viewerConfig.autoScroll && logsContainerRef.current) {
                setTimeout(() => {
                    logsContainerRef.current?.scrollTo({
                        top: logsContainerRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        } catch (error) {
            toast.error('Erro ao carregar logs: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }, [filters, viewerConfig.autoScroll]);

    /**
     * Load statistics
     */
    const loadStatistics = useCallback(async () => {
        try {
            const stats = await LogAPIController.getStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }, []);

    /**
     * Toggle real-time log streaming
     */
    const toggleRealTime = useCallback(() => {
        if (realTimeActive) {
            // Stop real-time
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setRealTimeActive(false);
            toast.info('Streaming de logs desativado');
        } else {
            // Start real-time
            try {
                const eventSource = LogAPIController.connectToLogStream(
                    (newLog: LogEntry) => {
                        setLogs(prev => {
                            const updated = [newLog, ...prev];
                            // Keep only maxLogs entries
                            return updated.slice(0, viewerConfig.maxLogs);
                        });
                    },
                    (error: string) => {
                        toast.error('Erro no streaming: ' + error);
                        setRealTimeActive(false);
                    },
                    {
                        level: filters.level,
                        category: filters.category
                    }
                );

                eventSourceRef.current = eventSource;
                setRealTimeActive(true);
                toast.success('Streaming de logs ativado');
            } catch (error) {
                toast.error('Falha ao conectar streaming: ' + (error as Error).message);
            }
        }
    }, [realTimeActive, filters.level, filters.category, viewerConfig.maxLogs]);

    /**
     * Export logs
     */
    const exportLogs = useCallback(async (format: 'txt' | 'json' = 'txt') => {
        try {
            await LogAPIController.exportLogs(filters, format);
            toast.success(`Logs exportados em formato ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Erro ao exportar logs: ' + (error as Error).message);
        }
    }, [filters]);

    /**
     * Cleanup old logs
     */
    const cleanupLogs = useCallback(async () => {
        try {
            const result = await LogAPIController.cleanupLogs();
            toast.success(
                `Limpeza concluída: ${result.filesRemoved} arquivos, ${result.databaseRecordsRemoved} registros removidos`
            );
            await loadLogs();
            await loadStatistics();
        } catch (error) {
            toast.error('Erro na limpeza: ' + (error as Error).message);
        }
    }, [loadLogs, loadStatistics]);

    /**
     * Create test log
     */
    const createTestLog = useCallback(async () => {
        try {
            const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SUCCESS'];
            const randomLevel = levels[Math.floor(Math.random() * levels.length)];
            const messages = [
                'Log de teste gerado via interface',
                'Testando sistema de logs unificado',
                'Verificando funcionamento do streaming',
                'Teste de conectividade com backend'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];

            await LogAPIController.createTestLog(randomLevel, 'TEST_UI', randomMessage);
            toast.success('Log de teste criado');

            if (!realTimeActive) {
                await loadLogs();
            }
        } catch (error) {
            toast.error('Erro ao criar log de teste: ' + (error as Error).message);
        }
    }, [realTimeActive, loadLogs]);

    /**
     * Handle filter changes
     */
    const handleFiltersChange = useCallback((newFilters: LogFiltersType) => {
        setFilters((prev: LogFiltersType) => ({ ...prev, ...newFilters, offset: 0 }));
    }, []);

    // Effects
    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        loadStatistics();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const breadcrumbs = [
        { label: 'Dashboard', to: '/' },
        { label: 'Logs' }
    ];

    const newTestButton = (
        <Button variant="default" size="sm" onClick={createTestLog} className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Criar Log de Teste
        </Button>
    );

    return (
        <PageContainer title="Logs" subtitle="Visualização unificada de logs" breadcrumbs={breadcrumbs} extra={newTestButton}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📋 Sistema de Logs</h1>
                    <p className="text-gray-600 mt-1">
                        Visualização unificada dos logs do sistema com streaming em tempo real
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={realTimeActive ? "destructive" : "default"}
                        onClick={toggleRealTime}
                        className="flex items-center gap-2"
                    >
                        {realTimeActive ? (
                            <>
                                <Square className="w-4 h-4" />
                                Parar Stream
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Stream Tempo Real
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => loadLogs()}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => exportLogs('txt')}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>

                    <Button
                        variant="outline"
                        onClick={createTestLog}
                        className="flex items-center gap-2"
                    >
                        <TestTube className="w-4 h-4" />
                        Teste
                    </Button>

                    <Button
                        variant="outline"
                        onClick={cleanupLogs}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpar
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <LogStatisticsCard statistics={statistics} />
            )}

            <Tabs defaultValue="logs" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="sessions">Sessões</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-4">
                    <PageCard cardTitle="Logs" cardExtra={(
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => loadLogs()} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </Button>
                        </div>
                    )}>
                        <LogFilters filters={filters} onFiltersChange={handleFiltersChange} onClear={() => setFilters({ limit: 100, offset: 0 })} />

                        <div className="mt-4">
                            <LogViewer logs={logs} loading={loading} className="" />
                        </div>
                    </PageCard>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                    <LogSessionList
                        sessions={statistics?.recentSessions || []}
                        onSessionSelect={(sessionId: string) => {
                            setFilters((prev: LogFiltersType) => ({ ...prev, sessionId, offset: 0 }));
                            // Switch back to logs tab
                            const logsTab = document.querySelector('[value="logs"]') as HTMLButtonElement;
                            logsTab?.click();
                        }}
                    />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {statistics && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Logs por Nível</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {Object.entries(statistics.logsByLevel).map(([level, count]) => (
                                                <div key={level} className="flex justify-between items-center">
                                                    <span className="capitalize">{level}</span>
                                                    <Badge variant="outline">{count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Logs por Categoria</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {Object.entries(statistics.logsByCategory)
                                                .sort(([, a], [, b]) => b - a)
                                                .slice(0, 10)
                                                .map(([category, count]) => (
                                                    <div key={category} className="flex justify-between items-center">
                                                        <span>{category}</span>
                                                        <Badge variant="outline">{count}</Badge>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}
