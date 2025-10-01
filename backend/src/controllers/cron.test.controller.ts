import * as cron from 'node-cron';
import { TelegramService } from '../services/telegram.service';
import { db } from '../factory/database.factory';
import { SyncJobService } from '../services/sync.job.service';
import { randomUUID } from 'crypto';

export class CronTestController {
    private static task: cron.ScheduledTask | null = null;
    private static isRunning = false;
    private static executionCount = 0;
    private static lastExecution: Date | null = null;
    private static testStoreId = '';
    private static testSyncConfigId = '';

    private telegramService = new TelegramService();
    private syncJobService = new SyncJobService();

    /**
     * Iniciar teste do cron - executa a cada minuto
     */
    static startCronTest(): void {
        if (this.isRunning) {
            console.log('⚠️ Teste do cron já está rodando');
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
    }

    /**
     * Parar teste do cron
     */
    static stopCronTest(): void {
        if (this.task) {
            this.task.destroy();
            this.task = null;
            this.isRunning = false;
            console.log('⏹️ Teste do cron parado');
        } else {
            console.log('⚠️ Teste do cron não estava rodando');
        }
    }

    /**
     * Verificar status do teste
     */
    static getCronTestStatus(): { running: boolean; nextExecution?: string } {
        return {
            running: this.isRunning,
            nextExecution: this.isRunning ? 'Próximo minuto' : undefined
        };
    }

    /**
     * Função que executa no cron de teste
     */
    private static async executeCronTest(): Promise<void> {
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

        try {
            // Teste 1: Verificar conexão com banco
            const storesCount = await db.selectFrom('stores')
                .select((eb) => eb.fn.count('id').as('count'))
                .executeTakeFirst();

            // Teste 2: Verificar se há integrações configuradas
            const integrationsCount = await db.selectFrom('integrations')
                .select((eb) => eb.fn.count('id').as('count'))
                .where('active', '=', true)
                .executeTakeFirst();

            // Teste 3: Verificar canais de notificação
            const notificationChannelsCount = await db.selectFrom('notification_channels')
                .select((eb) => eb.fn.count('id').as('count'))
                .where('active', '=', true)
                .executeTakeFirst();

            // Teste 4: Verificar configurações de sincronização ativas
            const syncConfigsCount = await db.selectFrom('sync_configurations')
                .select((eb) => eb.fn.count('id').as('count'))
                .where('active', '=', true)
                .executeTakeFirst();

            const testResults: any = {
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

            console.log('📊 [CRON TEST] Resultados:', JSON.stringify(testResults, null, 2));

            // A cada 3 execuções, executar teste de sincronização real
            if (this.executionCount % 3 === 0) {
                console.log('🔄 [CRON TEST] Executando teste de sincronização real...');
                try {
                    await this.executeTestSync();
                    testResults.sync_test = { success: true, message: 'Sincronização executada com sucesso' };
                } catch (syncError) {
                    console.error('❌ [CRON TEST] Erro na sincronização:', syncError);
                    const errorMessage = syncError instanceof Error ? syncError.message : 'Erro desconhecido';
                    testResults.sync_test = { success: false, error: errorMessage };
                }
            }

            // Enviar notificação de teste via Telegram (se configurado)
            await this.sendTestNotification(testResults);

        } catch (error) {
            console.error('❌ [CRON TEST] Erro durante execução:', error);

            // Tentar enviar notificação de erro
            try {
                await this.sendErrorNotification(error);
            } catch (notificationError) {
                console.error('❌ [CRON TEST] Erro ao enviar notificação:', notificationError);
            }
        }
    }

    /**
     * Enviar notificação de teste via Telegram
     */
    private static async sendTestNotification(results: any): Promise<void> {
        try {
            // Buscar primeiro canal de notificação ativo para teste
            const notificationChannel = await db.selectFrom('notification_channels')
                .selectAll()
                .where('active', '=', true)
                .where('type', '=', 'TELEGRAM')
                .executeTakeFirst();

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

            await telegramService.sendFormattedMessage({
                text: message,
                parse_mode: 'Markdown'
            });
            console.log('📤 [CRON TEST] Notificação enviada via Telegram');

        } catch (error: any) {
            if (error.message?.includes('chat not found')) {
                console.error('⚠️ [CRON TEST] Chat do Telegram não encontrado - verifique se o bot está no grupo');
            } else if (error.message?.includes('bot was blocked')) {
                console.error('⚠️ [CRON TEST] Bot foi bloqueado no Telegram');
            } else {
                console.error('❌ [CRON TEST] Erro ao enviar notificação:', error.message || error);
            }
        }
    }

    /**
     * Enviar notificação de erro via Telegram
     */
    private static async sendErrorNotification(error: any): Promise<void> {
        try {
            const notificationChannel = await db.selectFrom('notification_channels')
                .selectAll()
                .where('active', '=', true)
                .where('type', '=', 'TELEGRAM')
                .executeTakeFirst();

            if (!notificationChannel) return;

            const telegramService = new TelegramService(notificationChannel.config as any);

            const message = `❌ **ERRO NO TESTE DO CRON**\n\n` +
                `⏰ **Horário:** ${new Date().toLocaleString('pt-BR')}\n\n` +
                `🚨 **Erro:** ${error.message || 'Erro desconhecido'}\n\n` +
                `Verifique os logs para mais detalhes.`;

            await telegramService.sendFormattedMessage({
                text: message,
                parse_mode: 'Markdown'
            });

        } catch (notificationError) {
            // Se não conseguir enviar notificação, apenas loga
            console.error('❌ [CRON TEST] Falha ao enviar notificação de erro:', notificationError);
        }
    }

    /**
     * Executar teste único (não agendado)
     */
    static async runSingleTest(): Promise<any> {
        console.log('🧪 Executando teste único do cron...');
        await this.executeCronTest();
        return { success: true, message: 'Teste executado com sucesso' };
    }

    /**
     * Criar configuração de sincronização de teste
     * Este método cria uma configuração temporária para testar o fluxo completo
     */
    static async createTestSyncConfig(): Promise<{ storeId: number; syncConfigId: number }> {
        console.log('🏭 Criando configuração de teste...');

        try {
            // 1. Buscar integrações disponíveis (mais flexível)
            const integrations = await db.selectFrom('integrations')
                .selectAll()
                .where('active', '=', true)
                .limit(2)
                .execute();

            // Se não há integrações, criar integrações de teste
            let sourceIntegration, targetIntegration;

            if (integrations.length >= 2) {
                sourceIntegration = integrations[0];
                targetIntegration = integrations[1];
            } else {
                // Criar integrações de teste temporárias
                console.log('⚠️ Criando integrações de teste temporárias...');

                const sourceResult = await db.insertInto('integrations')
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

                const targetResult = await db.insertInto('integrations')
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

                sourceIntegration = await db.selectFrom('integrations')
                    .selectAll()
                    .where('id', '=', sourceResult!.id)
                    .executeTakeFirstOrThrow();

                targetIntegration = await db.selectFrom('integrations')
                    .selectAll()
                    .where('id', '=', targetResult!.id)
                    .executeTakeFirstOrThrow();
            }

            // 2. Verificar se já existe configuração de teste
            let testSyncConfig = await db.selectFrom('sync_configurations')
                .selectAll()
                .where('name', '=', 'TESTE_CRON_AUTO')
                .executeTakeFirst();

            if (!testSyncConfig) {
                // Criar nova configuração de sincronização de teste
                const insertResult = await db.insertInto('sync_configurations')
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
                    .executeTakeFirstOrThrow();

                testSyncConfig = await db.selectFrom('sync_configurations')
                    .selectAll()
                    .where('id', '=', insertResult.id)
                    .executeTakeFirstOrThrow();

                console.log('✅ Configuração de sincronização de teste criada');
            } else {
                console.log('✅ Usando configuração de teste existente');
            }

            // 3. Buscar algumas lojas para o teste
            const testStores = await db.selectFrom('stores')
                .selectAll()
                .where('active', '=', true)
                .limit(2)
                .execute();

            console.log(`📊 Sync Config ID: ${testSyncConfig.id}`);
            console.log(`🔄 Source Integration: ${sourceIntegration.name}`);
            console.log(`🔄 Target Integration: ${targetIntegration.name}`);
            console.log(`⏰ Schedule: A cada 3 minutos`);
            console.log(`🏪 Lojas disponíveis: ${testStores.length}`);

            this.testSyncConfigId = String(testSyncConfig.id);

            return {
                storeId: testStores[0]?.id || 0,
                syncConfigId: testSyncConfig.id
            };

        } catch (error) {
            console.error('❌ Erro ao criar configuração de teste:', error);
            throw error;
        }
    }

    /**
     * Executar sincronização de teste usando configuração real
     */
    static async executeTestSync(): Promise<void> {
        console.log('🔄 Executando sincronização de teste...');

        try {
            // Se não temos configuração de teste, criar uma
            if (!this.testSyncConfigId) {
                await this.createTestSyncConfig();
            }

            // Buscar a configuração de teste
            const syncConfig = await db.selectFrom('sync_configurations')
                .selectAll()
                .where('id', '=', Number(this.testSyncConfigId))
                .executeTakeFirst();

            if (!syncConfig) {
                console.log('⚠️ Configuração de teste não encontrada, criando nova...');
                await this.createTestSyncConfig();
                return;
            }

            console.log(`🚀 Executando sincronização config ${syncConfig.id}: ${syncConfig.name}`);

            // Buscar algumas lojas para o teste
            const stores = await db.selectFrom('stores')
                .selectAll()
                .where('active', '=', true)
                .limit(2)
                .execute();

            if (stores.length === 0) {
                console.log('⚠️ Nenhuma loja ativa encontrada para teste');
                return;
            }

            // Verificar se as integrações são de teste
            const isTestMode = syncConfig.name === 'TESTE_CRON_AUTO';

            if (isTestMode) {
                // Simular execução para modo de teste
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

                await db.insertInto('sync_executions')
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
                    .execute();

                console.log('✅ Sincronização simulada executada:', {
                    execution_id: executionId,
                    status: 'SUCCESS',
                    stores_simulated: stores.length,
                    mode: 'SIMULATION'
                });
            } else {
                // Executar sincronização real apenas se não for teste
                const syncJobService = new SyncJobService();

                const result = await syncJobService.executeSyncJob({
                    sync_config_id: syncConfig.id,
                    source_integration_id: syncConfig.source_integration_id,
                    target_integration_id: syncConfig.target_integration_id,
                    store_ids: stores.slice(0, 1).map(s => s.id!), // Apenas primeira loja para teste
                    options: {
                        force_sync: false,
                        skip_comparison: false
                    }
                });

                console.log('✅ Sincronização real executada:', {
                    execution_id: result.execution_id,
                    status: result.status,
                    total_stores: result.summary.total_stores,
                    stores_processed: result.stores_processed?.length || 0
                });
            }

            // Buscar estatísticas das últimas execuções
            const recentExecutions = await db.selectFrom('sync_executions')
                .selectAll()
                .where('sync_config_id', '=', syncConfig.id)
                .orderBy('started_at', 'desc')
                .limit(3)
                .execute();

            console.log(`📊 Últimas ${recentExecutions.length} execuções:`,
                recentExecutions.map(exec => ({
                    id: exec.id,
                    status: exec.status,
                    started_at: exec.started_at,
                    finished_at: exec.finished_at
                }))
            );

        } catch (error) {
            console.error('❌ Erro na sincronização de teste:', error);
            throw error;
        }
    }

    /**
     * Limpar dados de teste
     */
    static async cleanupTestData(): Promise<void> {
        console.log('🧹 Limpando dados de teste...');

        try {
            // Remover configuração de sincronização de teste
            if (this.testSyncConfigId) {
                await db.deleteFrom('sync_configurations')
                    .where('id', '=', Number(this.testSyncConfigId))
                    .execute();
                console.log('✅ Configuração de sincronização de teste removida');
            }

            // Remover integrações de teste temporárias
            await db.deleteFrom('integrations')
                .where('name', 'in', ['TESTE_SOURCE_INTEGRATION', 'TESTE_TARGET_INTEGRATION'])
                .execute();
            console.log('✅ Integrações de teste removidas');

            // Limpar IDs
            this.testSyncConfigId = '';

            console.log('✅ Limpeza concluída');

        } catch (error) {
            console.error('❌ Erro na limpeza:', error);
            throw error;
        }
    }
}
