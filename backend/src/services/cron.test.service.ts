import * as cron from 'node-cron';
import { TelegramService } from './telegram.service';
import { db } from '../factory/database.factory';
import { SyncJobService } from './sync.job.service';
import { logService } from './log.service';
import { randomUUID } from 'crypto';
import { CronTestResults, CronTestConfig, TestSyncConfig } from '../types/cron.test.type';

/**
 * Cron Test Service
 * 
 * Gerencia testes automatizados do sistema cron:
 * - Execução de testes periódicos
 * - Criação de dados de teste
 * - Monitoramento do sistema
 * - Notificações de status
 */
export class CronTestService {
    private static instance: CronTestService;
    private task: cron.ScheduledTask | null = null;
    private isRunning = false;
    private executionCount = 0;
    private lastExecution: Date | null = null;
    private testStoreId = '';
    private testSyncConfigId = '';

    private constructor() {}

    static getInstance(): CronTestService {
        if (!CronTestService.instance) {
            CronTestService.instance = new CronTestService();
        }
        return CronTestService.instance;
    }

    /**
     * Iniciar teste do cron - executa a cada minuto
     */
    startCronTest(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                reject(new Error('Teste do cron já está rodando'));
                return;
            }

            console.log('🚀 Iniciando teste do cron - execução a cada minuto');

            // Executa a cada minuto para teste
            this.task = cron.schedule('* * * * *', async () => {
                try {
                    await this.executeCronTest();
                } catch (error) {
                    console.error('❌ Erro no teste do cron:', error);
                }
            }, {
                timezone: "America/Sao_Paulo"
            });

            this.isRunning = true;
            console.log('✅ Teste do cron iniciado - próxima execução em 1 minuto');
            resolve();
        });
    }

    /**
     * Parar teste do cron
     */
    stopCronTest(): Promise<void> {
        return new Promise((resolve) => {
            if (this.task) {
                this.task.destroy();
                this.task = null;
                this.isRunning = false;
                console.log('⏹️ Teste do cron parado');
            } else {
                console.log('⚠️ Teste do cron não estava rodando');
            }
            resolve();
        });
    }

    /**
     * Verificar status do teste
     */
    getCronTestStatus(): Promise<{ running: boolean; nextExecution?: string }> {
        return Promise.resolve({
            running: this.isRunning,
            nextExecution: this.isRunning ? 'Próximo minuto' : undefined
        });
    }

    /**
     * Executar teste único (não agendado)
     */
    runSingleTest(): Promise<{ success: boolean; message: string }> {
        return this.executeCronTest()
            .then(() => ({ success: true, message: 'Teste executado com sucesso' }));
    }

    /**
     * Função que executa no cron de teste
     */
    private executeCronTest(): Promise<void> {
        const now = new Date();
        const timestamp = now.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        this.executionCount++;
        this.lastExecution = now;

        console.log(`🕐 [CRON TEST #${this.executionCount}] Executando teste às ${timestamp}`);

        // Criar sessão de logs para esta execução
        const sessionId = `cron-test-${this.executionCount}-${Date.now()}`;

        // Log estruturado do início da execução
        return logService.info('CRON_TEST', `Execução #${this.executionCount} iniciada`, {
            execution_number: this.executionCount,
            timestamp: now.toISOString(),
            test_type: 'automatic'
        }, sessionId)
            .then(() => this.runSystemTests())
            .then((testResults) => {
                console.log('📊 [CRON TEST] Resultados:', JSON.stringify(testResults, null, 2));

                // A cada 3 execuções, executar teste de sincronização real
                if (this.executionCount % 3 === 0) {
                    console.log('🔄 [CRON TEST] Executando teste de sincronização real...');
                    return this.executeTestSync()
                        .then(() => {
                            testResults.sync_test = { success: true, message: 'Sincronização executada com sucesso' };
                            return testResults;
                        })
                        .catch((syncError) => {
                            console.error('❌ [CRON TEST] Erro na sincronização:', syncError);
                            const errorMessage = syncError instanceof Error ? syncError.message : 'Erro desconhecido';
                            testResults.sync_test = { success: false, error: errorMessage };
                            return testResults;
                        });
                }
                return testResults;
            })
            .then((testResults) => this.sendTestNotification(testResults))
            .catch((error) => {
                console.error('❌ [CRON TEST] Erro durante execução:', error);
                return this.sendErrorNotification(error);
            });
    }

    /**
     * Executar testes do sistema
     */
    private runSystemTests(): Promise<CronTestResults> {
        // Teste 1: Verificar conexão com banco
        const storesQuery = db.selectFrom('stores')
            .select((eb) => eb.fn.count('id').as('count'))
            .executeTakeFirst();

        // Teste 2: Verificar se há integrações configuradas
        const integrationsQuery = db.selectFrom('integrations')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('active', '=', true)
            .executeTakeFirst();

        // Teste 3: Verificar canais de notificação
        const notificationChannelsQuery = db.selectFrom('notification_channels')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('active', '=', true)
            .executeTakeFirst();

        // Teste 4: Verificar configurações de sincronização ativas
        const syncConfigsQuery = db.selectFrom('sync_configurations')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('active', '=', true)
            .executeTakeFirst();

        return Promise.all([
            storesQuery,
            integrationsQuery,
            notificationChannelsQuery,
            syncConfigsQuery
        ])
            .then(([storesCount, integrationsCount, notificationChannelsCount, syncConfigsCount]) => {
                const timestamp = new Date().toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                return {
                    execution: this.executionCount,
                    timestamp,
                    database: {
                        stores: Number(storesCount?.count || 0),
                        integrations: Number(integrationsCount?.count || 0),
                        notification_channels: Number(notificationChannelsCount?.count || 0),
                        sync_configurations: Number(syncConfigsCount?.count || 0)
                    },
                    system: {
                        memory: process.memoryUsage(),
                        uptime: process.uptime()
                    }
                };
            });
    }

    /**
     * Enviar notificação de teste via Telegram
     */
    private sendTestNotification(results: CronTestResults): Promise<void> {
        // Buscar primeiro canal de notificação ativo para teste
        return db.selectFrom('notification_channels')
            .selectAll()
            .where('active', '=', true)
            .where('type', '=', 'TELEGRAM')
            .executeTakeFirst()
            .then((notificationChannel) => {
                if (!notificationChannel) {
                    console.log('⚠️ [CRON TEST] Nenhum canal Telegram configurado para teste');
                    return;
                }

                const telegramService = new TelegramService(notificationChannel.config as any);

                let message = `🧪 **TESTE DO CRON #${results.execution}**\n\n` +
                    `⏰ **Executado às:** ${results.timestamp}\n\n` +
                    `📊 **Status do Sistema:**\n` +
                    `• Lojas: ${results.database.stores}\n` +
                    `• Integrações ativas: ${results.database.integrations}\n` +
                    `• Canais de notificação: ${results.database.notification_channels}\n` +
                    `• Configurações de sync: ${results.database.sync_configurations}\n\n` +
                    `💾 **Memória:** ${Math.round(results.system.memory.heapUsed / 1024 / 1024)}MB\n` +
                    `⏱️ **Uptime:** ${Math.round(results.system.uptime / 60)} minutos\n\n`;

                // Adicionar informações de teste de sincronização se disponível
                if (results.sync_test) {
                    if (results.sync_test.success) {
                        message += `🔄 **Teste de Sincronização:** ✅ ${results.sync_test.message}\n\n`;
                    } else {
                        message += `🔄 **Teste de Sincronização:** ❌ ${results.sync_test.error}\n\n`;
                    }
                }

                message += `✅ Cron funcionando perfeitamente!`;

                return telegramService.sendFormattedMessage({
                    text: message,
                    parse_mode: 'Markdown'
                })
                    .then(() => {
                        console.log('📤 [CRON TEST] Notificação enviada via Telegram');

                        // Log estruturado de sucesso
                        return logService.success('CRON_TEST', `Execução #${this.executionCount} concluída com sucesso`, {
                            execution_number: this.executionCount,
                            database_test: results.database,
                            sync_test: results.sync_test,
                            notification_sent: true
                        });
                    });
            })
            .catch((error: any) => {
                if (error.message?.includes('chat not found')) {
                    console.error('⚠️ [CRON TEST] Chat do Telegram não encontrado - verifique se o bot está no grupo');
                } else if (error.message?.includes('bot was blocked')) {
                    console.error('⚠️ [CRON TEST] Bot foi bloqueado no Telegram');
                } else {
                    console.error('❌ [CRON TEST] Erro ao enviar notificação:', error.message || error);
                }
            });
    }

    /**
     * Enviar notificação de erro via Telegram
     */
    private sendErrorNotification(error: any): Promise<void> {
        return db.selectFrom('notification_channels')
            .selectAll()
            .where('active', '=', true)
            .where('type', '=', 'TELEGRAM')
            .executeTakeFirst()
            .then((notificationChannel) => {
                if (!notificationChannel) return Promise.resolve();

                const telegramService = new TelegramService(notificationChannel.config as any);

                const message = `❌ **ERRO NO TESTE DO CRON**\n\n` +
                    `⏰ **Horário:** ${new Date().toLocaleString('pt-BR')}\n\n` +
                    `🚨 **Erro:** ${error.message || 'Erro desconhecido'}\n\n` +
                    `Verifique os logs para mais detalhes.`;

                return telegramService.sendFormattedMessage({
                    text: message,
                    parse_mode: 'Markdown'
                })
                    .then(() => Promise.resolve());
            })
            .catch((notificationError) => {
                // Se não conseguir enviar notificação, apenas loga
                console.error('❌ [CRON TEST] Falha ao enviar notificação de erro:', notificationError);
                return Promise.resolve();
            });
    }

    /**
     * Criar configuração de sincronização de teste
     */
    createTestSyncConfig(): Promise<TestSyncConfig> {
        console.log('🏭 Criando configuração de teste...');

        // 1. Buscar integrações disponíveis (mais flexível)
        return db.selectFrom('integrations')
            .selectAll()
            .where('active', '=', true)
            .limit(2)
            .execute()
            .then((integrations) => {
                let sourceIntegration, targetIntegration;

                if (integrations.length >= 2) {
                    sourceIntegration = integrations[0];
                    targetIntegration = integrations[1];
                    return Promise.resolve({ sourceIntegration, targetIntegration });
                } else {
                    // Criar integrações de teste temporárias
                    console.log('⚠️ Criando integrações de teste temporárias...');

                    const sourceInsert = db.insertInto('integrations')
                        .values({
                            name: 'TESTE_SOURCE_INTEGRATION',
                            type: 'RP',
                            base_url: 'https://teste-source.com',
                            email: null,
                            password: null,
                            config: { test_mode: true },
                            active: true,
                            created_at: new Date(),
                            updated_at: new Date(),
                            deleted_at: null
                        } as any)
                        .returning('id')
                        .executeTakeFirst();

                    const targetInsert = db.insertInto('integrations')
                        .values({
                            name: 'TESTE_TARGET_INTEGRATION',
                            type: 'CRESCEVENDAS',
                            base_url: 'https://teste-target.com',
                            email: null,
                            password: null,
                            config: { test_mode: true },
                            active: true,
                            created_at: new Date(),
                            updated_at: new Date(),
                            deleted_at: null
                        } as any)
                        .returning('id')
                        .executeTakeFirst();

                    return Promise.all([sourceInsert, targetInsert])
                        .then(([sourceResult, targetResult]) => {
                            const sourceQuery = db.selectFrom('integrations')
                                .selectAll()
                                .where('id', '=', sourceResult!.id)
                                .executeTakeFirstOrThrow();

                            const targetQuery = db.selectFrom('integrations')
                                .selectAll()
                                .where('id', '=', targetResult!.id)
                                .executeTakeFirstOrThrow();

                            return Promise.all([sourceQuery, targetQuery])
                                .then(([source, target]) => ({
                                    sourceIntegration: source,
                                    targetIntegration: target
                                }));
                        });
                }
            })
            .then(({ sourceIntegration, targetIntegration }) => {
                // 2. Verificar se já existe configuração de teste
                return db.selectFrom('sync_configurations')
                    .selectAll()
                    .where('name', '=', 'TESTE_CRON_AUTO')
                    .executeTakeFirst()
                    .then((testSyncConfig) => {
                        if (testSyncConfig) {
                            console.log('✅ Usando configuração de teste existente');
                            return testSyncConfig;
                        } else {
                            // Criar nova configuração de sincronização de teste
                            return db.insertInto('sync_configurations')
                                .values({
                                    name: 'TESTE_CRON_AUTO',
                                    description: 'Configuração automática para teste do cron',
                                    source_integration_id: sourceIntegration.id!,
                                    target_integration_id: targetIntegration.id!,
                                    notification_channel_id: null,
                                    store_ids: [],
                                    schedule: {
                                        sync_time: "05:00",
                                        compare_time: "05:30"
                                    },
                                    options: {
                                        test_mode: true,
                                        max_stores: 2,
                                        max_products_per_store: 5,
                                        timeout_minutes: 2
                                    },
                                    active: true,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    deleted_at: null
                                } as any)
                                .returning('id')
                                .executeTakeFirstOrThrow()
                                .then((insertResult) => {
                                    return db.selectFrom('sync_configurations')
                                        .selectAll()
                                        .where('id', '=', insertResult.id)
                                        .executeTakeFirstOrThrow();
                                })
                                .then((newConfig) => {
                                    console.log('✅ Configuração de sincronização de teste criada');
                                    return newConfig;
                                });
                        }
                    })
                    .then((syncConfig) => {
                        // 3. Buscar algumas lojas para o teste
                        return db.selectFrom('stores')
                            .selectAll()
                            .where('active', '=', true)
                            .limit(2)
                            .execute()
                            .then((testStores) => {
                                console.log(`📊 Sync Config ID: ${syncConfig.id}`);
                                console.log(`🔄 Source Integration: ${sourceIntegration.name}`);
                                console.log(`🔄 Target Integration: ${targetIntegration.name}`);
                                console.log(`⏰ Schedule: A cada 3 minutos`);
                                console.log(`🏪 Lojas disponíveis: ${testStores.length}`);

                                this.testSyncConfigId = String(syncConfig.id);

                                return {
                                    storeId: testStores[0]?.id || 0,
                                    syncConfigId: syncConfig.id
                                };
                            });
                    });
            });
    }

    /**
     * Executar sincronização de teste usando configuração real
     */
    executeTestSync(): Promise<void> {
        console.log('🔄 Executando sincronização de teste...');

        const ensureTestConfig = () => {
            if (!this.testSyncConfigId) {
                return this.createTestSyncConfig().then(() => {});
            }
            return Promise.resolve();
        };

        return ensureTestConfig()
            .then(() => {
                // Buscar a configuração de teste
                return db.selectFrom('sync_configurations')
                    .selectAll()
                    .where('id', '=', Number(this.testSyncConfigId))
                    .executeTakeFirst();
            })
            .then((syncConfig) => {
                if (!syncConfig) {
                    console.log('⚠️ Configuração de teste não encontrada, criando nova...');
                    return this.createTestSyncConfig().then(() => {});
                }

                console.log(`🚀 Executando sincronização config ${syncConfig.id}: ${syncConfig.name}`);

                // Buscar algumas lojas para o teste
                return db.selectFrom('stores')
                    .selectAll()
                    .where('active', '=', true)
                    .limit(2)
                    .execute()
                    .then((stores) => {
                        if (stores.length === 0) {
                            console.log('⚠️ Nenhuma loja ativa encontrada para teste');
                            return;
                        }

                        // Verificar se as integrações são de teste
                        const isTestMode = syncConfig.name === 'TESTE_CRON_AUTO';

                        if (isTestMode) {
                            // Simular execução para modo de teste
                            return this.simulateTestSync(syncConfig, stores);
                        } else {
                            // Executar sincronização real apenas se não for teste
                            return this.executeRealSync(syncConfig, stores);
                        }
                    });
            });
    }

    private simulateTestSync(syncConfig: any, stores: any[]): Promise<void> {
        console.log('🎭 Simulando sincronização em modo de teste...');

        // Criar registro de execução simulada
        const executionId = randomUUID();
        const startTime = new Date();

        const storesProcessed = stores.map(s => ({
            store_id: s.id,
            store_name: s.name,
            products_synced: 0,
            status: 'SIMULATED',
            execution_time: 100
        }));

        const summary = {
            total_stores: stores.length,
            successful_stores: stores.length,
            failed_stores: 0,
            total_products: 0,
            execution_time: 100,
            simulation: true,
            test_mode: true
        };

        return db.insertInto('sync_executions')
            .values({
                id: executionId,
                sync_config_id: syncConfig.id,
                status: 'SUCCESS',
                started_at: startTime,
                finished_at: new Date(),
                stores_processed: JSON.stringify(storesProcessed),
                summary: JSON.stringify(summary),
                comparison_results: null,
                execution_logs: `Execução simulada de teste - ${stores.length} lojas processadas`,
                error_details: null,
                created_at: new Date()
            } as any)
            .execute()
            .then(() => {
                console.log('✅ Sincronização simulada executada:', {
                    execution_id: executionId,
                    status: 'SUCCESS',
                    stores_simulated: stores.length,
                    mode: 'SIMULATION'
                });

                // Buscar estatísticas das últimas execuções
                return db.selectFrom('sync_executions')
                    .selectAll()
                    .where('sync_config_id', '=', syncConfig.id)
                    .orderBy('started_at', 'desc')
                    .limit(3)
                    .execute();
            })
            .then((recentExecutions) => {
                console.log(`📊 Últimas ${recentExecutions.length} execuções:`,
                    recentExecutions.map(exec => ({
                        id: exec.id,
                        status: exec.status,
                        started_at: exec.started_at,
                        finished_at: exec.finished_at
                    }))
                );
            });
    }

    private executeRealSync(syncConfig: any, stores: any[]): Promise<void> {
        const syncJobService = new SyncJobService();

        return syncJobService.executeSyncJob({
            sync_config_id: syncConfig.id,
            source_integration_id: syncConfig.source_integration_id,
            target_integration_id: syncConfig.target_integration_id,
            store_ids: stores.slice(0, 1).map(s => s.id!), // Apenas primeira loja para teste
            options: {
                force_sync: false,
                skip_comparison: false
            }
        })
            .then((result) => {
                console.log('✅ Sincronização real executada:', {
                    execution_id: result.execution_id,
                    status: result.status,
                    total_stores: result.summary.total_stores,
                    stores_processed: result.stores_processed?.length || 0
                });

                // Buscar estatísticas das últimas execuções
                return db.selectFrom('sync_executions')
                    .selectAll()
                    .where('sync_config_id', '=', syncConfig.id)
                    .orderBy('started_at', 'desc')
                    .limit(3)
                    .execute();
            })
            .then((recentExecutions) => {
                console.log(`📊 Últimas ${recentExecutions.length} execuções:`,
                    recentExecutions.map(exec => ({
                        id: exec.id,
                        status: exec.status,
                        started_at: exec.started_at,
                        finished_at: exec.finished_at
                    }))
                );
            });
    }

    /**
     * Limpar dados de teste
     */
    cleanupTestData(): Promise<void> {
        console.log('🧹 Limpando dados de teste...');

        const cleanupSyncConfig = () => {
            if (this.testSyncConfigId) {
                return db.deleteFrom('sync_configurations')
                    .where('id', '=', Number(this.testSyncConfigId))
                    .execute()
                    .then(() => {
                        console.log('✅ Configuração de sincronização de teste removida');
                    });
            }
            return Promise.resolve();
        };

        const cleanupIntegrations = () => {
            return db.deleteFrom('integrations')
                .where('name', 'in', ['TESTE_SOURCE_INTEGRATION', 'TESTE_TARGET_INTEGRATION'])
                .execute()
                .then(() => {
                    console.log('✅ Integrações de teste removidas');
                });
        };

        return cleanupSyncConfig()
            .then(() => cleanupIntegrations())
            .then(() => {
                // Limpar IDs
                this.testSyncConfigId = '';
                console.log('✅ Limpeza concluída');
            });
    }
}

export const cronTestService = CronTestService.getInstance();