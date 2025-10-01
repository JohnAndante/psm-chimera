import { db } from '../factory/database.factory.js';
import { RPIntegrationService } from './rp.integration.service.js';
import { CresceVendasIntegrationService } from './crescevendas.integration.service.js';
import { productService } from './product.service.js';
import { integrationService } from './integration.service.js';
import { notificationChannelService } from './notificationChannel.service.js';
import { getTelegramService } from './telegram.service.js';
import { SyncResult, SyncSummary } from '../types/notification.type.js';
import {
    SyncExecutionRequest,
    SyncExecutionResult,
    SyncStatus,
    ComparisonResult,
    ProductComparison,
    DifferenceType
} from '../types/sync.type.js';
import { NotificationChannelType, TelegramConfig } from '../types/notification.type.js';

class SyncService {

    /**
     * Executa sincronização RP → CresceVendas
     */
    async executeSync(request: SyncExecutionRequest): Promise<SyncExecutionResult> {
        const executionId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();

        console.log(`[SYNC] Iniciando execução: ${executionId}`);

        try {
            // Buscar integrações
            const [sourceIntegration, targetIntegration] = await Promise.all([
                integrationService.findById(request.source_integration_id!),
                integrationService.findById(request.target_integration_id!)
            ]);

            if (!sourceIntegration || !targetIntegration) {
                throw new Error('Integrações não encontradas');
            }

            if (!sourceIntegration.active || !targetIntegration.active) {
                throw new Error('Uma ou mais integrações estão inativas');
            }

            // Inicializar serviços
            const rpService = new RPIntegrationService(sourceIntegration.config);
            const cvService = new CresceVendasIntegrationService(targetIntegration.config);

            // Buscar lojas para sincronizar
            const stores = await this.getStoresToSync(request.store_ids);

            console.log(`[SYNC] Sincronizando ${stores.length} lojas`);

            // Enviar notificação de início
            if (request.notification_channel_id) {
                await this.sendStartNotification(
                    request.notification_channel_id,
                    stores.length,
                    executionId
                );
            }

            // Executar sync para cada loja (com cache)
            const storeResults = [];
            let totalProducts = 0;

            for (const store of stores) {
                try {
                    console.log(`[SYNC] Processando loja: ${store.name} (${store.registration})`);

                    // ETAPA 1: Buscar produtos da RP e salvar no cache local
                    const rpProducts = await rpService.getProductsByStore(store.registration);
                    console.log(`[SYNC] Encontrados ${rpProducts.length} produtos na RP`);

                    // Converter produtos RP para formato interno
                    const internalProducts = productService.parseRPProducts(rpProducts, store.id);

                    // Salvar no cache local (tabela products)
                    await productService.upsertProducts(store.id, internalProducts);
                    console.log(`[SYNC] ${internalProducts.length} produtos salvos no cache local`);

                    // ETAPA 2: Buscar produtos do cache e enviar para CresceVendas
                    const cachedProducts = await productService.getByStoreId(store.id, { active_only: true });
                    const cvProducts = productService.formatForCresceVendas(cachedProducts);

                    const cvResult = await cvService.sendProducts(store.registration, cvProducts);

                    if (cvResult.error) {
                        throw new Error(cvResult.error);
                    }

                    console.log(`[SYNC] ${cvProducts.length} produtos enviados para CresceVendas`);

                    storeResults.push({
                        store_id: store.id,
                        store_name: store.name,
                        products_synced: cvProducts.length,
                        status: 'SUCCESS' as const
                    });

                    totalProducts += cvProducts.length;

                } catch (error: any) {
                    console.error(`[SYNC] Erro na loja ${store.name}:`, error.message);

                    storeResults.push({
                        store_id: store.id,
                        store_name: store.name,
                        products_synced: 0,
                        status: 'FAILED' as const,
                        error: error.message
                    });
                }
            } const executionTime = Date.now() - startTime;
            const successfulStores = storeResults.filter(r => r.status === 'SUCCESS').length;
            const failedStores = storeResults.filter(r => r.status === 'FAILED').length;

            const result: SyncExecutionResult = {
                execution_id: executionId,
                sync_config_id: request.sync_config_id,
                status: failedStores === 0 ? SyncStatus.SUCCESS : (successfulStores > 0 ? SyncStatus.SUCCESS : SyncStatus.FAILED),
                started_at: new Date(startTime),
                finished_at: new Date(),
                stores_processed: storeResults,
                summary: {
                    total_stores: stores.length,
                    successful_stores: successfulStores,
                    failed_stores: failedStores,
                    total_products: totalProducts,
                    execution_time: executionTime
                }
            };

            // Executar comparação se não foi pulada
            if (!request.options?.skip_comparison) {
                result.comparison_results = await this.executeComparison(
                    rpService,
                    cvService,
                    stores,
                    executionId
                );
            }

            // Salvar resultado
            await this.saveExecutionResult(result);

            // Enviar notificação de conclusão
            if (request.notification_channel_id) {
                await this.sendCompletionNotification(
                    request.notification_channel_id,
                    result
                );
            }

            console.log(`[SYNC] Execução concluída: ${executionId} - ${result.status}`);
            return result;

        } catch (error: any) {
            console.error(`[SYNC] Erro na execução ${executionId}:`, error.message);

            const result: SyncExecutionResult = {
                execution_id: executionId,
                sync_config_id: request.sync_config_id,
                status: SyncStatus.FAILED,
                started_at: new Date(startTime),
                finished_at: new Date(),
                stores_processed: [],
                summary: {
                    total_stores: 0,
                    successful_stores: 0,
                    failed_stores: 0,
                    total_products: 0,
                    execution_time: Date.now() - startTime
                }
            };

            await this.saveExecutionResult(result);
            throw error;
        }
    }

    /**
     * Busca lojas para sincronizar
     */
    private async getStoresToSync(storeIds?: number[]): Promise<any[]> {
        let query = db.selectFrom('stores')
            .select(['id', 'name', 'registration'])
            .where('active', '=', true)
            .where('deleted_at', 'is', null);

        if (storeIds && storeIds.length > 0) {
            query = query.where('id', 'in', storeIds);
        }

        return await query.execute();
    }



    /**
     * Executa comparação entre RP e CresceVendas
     */
    private async executeComparison(
        rpService: RPIntegrationService,
        cvService: CresceVendasIntegrationService,
        stores: any[],
        executionId: string
    ): Promise<ComparisonResult[]> {
        console.log(`[SYNC] Iniciando comparação para execução: ${executionId}`);

        const comparisonResults: ComparisonResult[] = [];

        for (const store of stores) {
            try {
                // Buscar dados de ambas as fontes
                const [cachedProducts, cvProducts] = await Promise.all([
                    productService.getByStoreId(store.id, { active_only: true }),
                    cvService.getActiveProducts(store.registration)
                ]);

                // Criar mapas para comparação
                const cachedMap = new Map(cachedProducts.map((p: any) => [p.code, p]));
                const cvMap = new Map((cvProducts.discount_store_lines || []).map((p: any) => [p.code, p]));

                const missing: ProductComparison[] = [];
                const priceDiff: ProductComparison[] = [];
                const statusDiff: ProductComparison[] = [];

                // Verificar produtos que estão no cache mas não na CresceVendas
                for (const [code, cachedProduct] of cachedMap) {
                    if (!cvMap.has(code)) {
                        missing.push({
                            product_code: code.toString(),
                            rp_data: {
                                price: cachedProduct.price,
                                final_price: cachedProduct.final_price,
                                active: true
                            },
                            difference_type: DifferenceType.MISSING
                        });
                    } else {
                        const cvProduct = cvMap.get(code) as any;

                        // Verificar diferenças de preço
                        if (Math.abs(cachedProduct.final_price - cvProduct.final_price) > 0.01) {
                            priceDiff.push({
                                product_code: code.toString(),
                                rp_data: {
                                    price: cachedProduct.price,
                                    final_price: cachedProduct.final_price,
                                    active: true
                                },
                                crescevendas_data: {
                                    price: cvProduct.price,
                                    final_price: cvProduct.final_price,
                                    active: true
                                },
                                difference_type: DifferenceType.PRICE_DIFF
                            });
                        }
                    }
                } comparisonResults.push({
                    store_id: store.id,
                    store_name: store.name,
                    differences_found: missing.length + priceDiff.length + statusDiff.length,
                    missing_products: missing.length,
                    price_differences: priceDiff.length,
                    status_differences: statusDiff.length,
                    details: {
                        missing,
                        price_diff: priceDiff,
                        status_diff: statusDiff
                    }
                });

            } catch (error: any) {
                console.error(`[SYNC] Erro na comparação da loja ${store.name}:`, error.message);

                comparisonResults.push({
                    store_id: store.id,
                    store_name: store.name,
                    differences_found: 0,
                    missing_products: 0,
                    price_differences: 0,
                    status_differences: 0,
                    details: {
                        missing: [],
                        price_diff: [],
                        status_diff: []
                    }
                });
            }
        }

        return comparisonResults;
    }

    /**
     * Salva resultado da execução
     */
    private async saveExecutionResult(result: SyncExecutionResult): Promise<void> {
        try {
            await db.insertInto('sync_executions')
                .values({
                    id: result.execution_id,
                    sync_config_id: result.sync_config_id || null,
                    status: result.status,
                    started_at: result.started_at,
                    finished_at: result.finished_at || null,
                    stores_processed: JSON.stringify(result.stores_processed),
                    summary: JSON.stringify(result.summary),
                    comparison_results: result.comparison_results ? JSON.stringify(result.comparison_results) : null,
                    created_at: new Date()
                } as any)
                .execute();
        } catch (error) {
            console.error('[SYNC] Erro ao salvar resultado:', error);
        }
    }

    /**
     * Envia notificação de início
     */
    private async sendStartNotification(
        channelId: number,
        storeCount: number,
        executionId: string
    ): Promise<void> {
        try {
            const channel = await notificationChannelService.getChannelById(channelId);

            if (channel && channel.active && channel.type === NotificationChannelType.TELEGRAM) {
                const telegramConfig = channel.config as TelegramConfig;
                const telegramService = getTelegramService(telegramConfig);

                await telegramService.notifySyncStart(storeCount, `Execução ${executionId}`);
            }
        } catch (error) {
            console.error('[SYNC] Erro ao enviar notificação de início:', error);
        }
    }

    /**
     * Envia notificação de conclusão
     */
    async sendCompletionNotification(
        channelId: number,
        result: SyncExecutionResult
    ): Promise<void> {
        try {
            const channel = await notificationChannelService.getChannelById(channelId);

            if (channel && channel.active && channel.type === NotificationChannelType.TELEGRAM) {
                const telegramConfig = channel.config as TelegramConfig;
                const telegramService = getTelegramService(telegramConfig);

                // Converter resultados para o formato do template
                const syncResults: SyncResult[] = result.stores_processed.map(store => ({
                    store_id: store.store_id,
                    store_name: store.store_name,
                    products_synced: store.products_synced,
                    status: store.status === 'SUCCESS' ? 'success' : 'failed',
                    error: store.error
                }));

                const summary: SyncSummary = {
                    total_stores: result.summary.total_stores,
                    successful_stores: result.summary.successful_stores,
                    failed_stores: result.summary.failed_stores,
                    total_products: result.summary.total_products,
                    execution_time_ms: result.summary.execution_time
                };

                if (result.status === SyncStatus.SUCCESS || result.summary.successful_stores > 0) {
                    await telegramService.notifySyncSuccess(syncResults, summary);
                } else {
                    const errorMessage = result.stores_processed
                        .filter(s => s.error)
                        .map(s => `${s.store_name}: ${s.error}`)
                        .join('\n');

                    await telegramService.notifySyncError(
                        errorMessage || 'Erro desconhecido',
                        `Execução ${result.execution_id}`
                    );
                }
            }
        } catch (error) {
            console.error('[SYNC] Erro ao enviar notificação de conclusão:', error);
        }
    }

    /**
     * Lista execuções de sync
     */
    async getExecutions(limit: number = 50): Promise<any[]> {
        return await db.selectFrom('sync_executions')
            .selectAll()
            .orderBy('started_at', 'desc')
            .limit(limit)
            .execute();
    }

    /**
     * Busca execução por ID
     */
    async getExecutionById(executionId: string): Promise<any | null> {
        return await db.selectFrom('sync_executions')
            .selectAll()
            .where('id', '=', executionId)
            .executeTakeFirst();
    }

    /**
     * Cria uma nova configuração de sync
     */
    async createSyncConfiguration(data: any): Promise<any> {
        const result = await db.insertInto('sync_configurations')
            .values({
                name: data.name,
                description: data.description || null,
                source_integration_id: data.source_integration_id,
                target_integration_id: data.target_integration_id,
                notification_channel_id: data.notification_channel_id || null,
                store_ids: JSON.stringify(data.store_ids || []),
                schedule: JSON.stringify(data.schedule || {}),
                options: JSON.stringify(data.options || {}),
                active: data.active !== undefined ? data.active : true
            } as any)
            .returning(['id'])
            .executeTakeFirst();

        if (result?.id) {
            return this.getSyncConfigurationById(result.id);
        }

        throw new Error('Falha ao criar configuração de sync');
    }

    /**
     * Atualiza uma configuração de sync
     */
    async update(data: any): Promise<any> {
        const { id, ...updateData } = data;

        const result = await db.updateTable('sync_configurations')
            .set({
                ...updateData,
                updated_at: new Date()
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returning(['id'])
            .executeTakeFirst();

        if (result?.id) {
            return this.getSyncConfigurationById(result.id);
        }

        throw new Error('Configuração não encontrada ou falha na atualização');
    }

    /**
     * Lista todas as configurações de sync com relacionamentos
     */
    async getAllSyncConfigurations(): Promise<any[]> {
        return await db.selectFrom('sync_configurations as sc')
            .leftJoin('integrations as si', 'sc.source_integration_id', 'si.id')
            .leftJoin('integrations as ti', 'sc.target_integration_id', 'ti.id')
            .leftJoin('notification_channels as nc', 'sc.notification_channel_id', 'nc.id')
            .select([
                // Campos da sync_configuration
                'sc.id',
                'sc.name',
                'sc.description',
                'sc.source_integration_id',
                'sc.target_integration_id',
                'sc.notification_channel_id',
                'sc.store_ids',
                'sc.schedule',
                'sc.options',
                'sc.active',
                'sc.created_at',
                'sc.updated_at',
                'sc.deleted_at',

                // Campos da source_integration
                'si.id as source_integration_id_full',
                'si.name as source_integration_name',
                'si.type as source_integration_type',
                'si.base_url as source_integration_base_url',
                'si.email as source_integration_email',
                'si.password as source_integration_password',
                'si.config as source_integration_config',
                'si.active as source_integration_active',
                'si.created_at as source_integration_created_at',
                'si.updated_at as source_integration_updated_at',
                'si.deleted_at as source_integration_deleted_at',

                // Campos da target_integration
                'ti.id as target_integration_id_full',
                'ti.name as target_integration_name',
                'ti.type as target_integration_type',
                'ti.base_url as target_integration_base_url',
                'ti.email as target_integration_email',
                'ti.password as target_integration_password',
                'ti.config as target_integration_config',
                'ti.active as target_integration_active',
                'ti.created_at as target_integration_created_at',
                'ti.updated_at as target_integration_updated_at',
                'ti.deleted_at as target_integration_deleted_at',

                // Campos da notification_channel
                'nc.id as notification_channel_id_full',
                'nc.name as notification_channel_name',
                'nc.type as notification_channel_type',
                'nc.config as notification_channel_config',
                'nc.active as notification_channel_active',
                'nc.created_at as notification_channel_created_at',
                'nc.updated_at as notification_channel_updated_at',
                'nc.deleted_at as notification_channel_deleted_at'
            ])
            .where('sc.deleted_at', 'is', null)
            .execute()
            .then(rows => rows.map(row => this.transformSyncConfigRow(row)));
    }

    /**
     * Busca uma configuração de sync específica por ID
     */
    async getSyncConfigurationById(id: number): Promise<any | null> {
        const result = await db.selectFrom('sync_configurations as sc')
            .leftJoin('integrations as si', 'sc.source_integration_id', 'si.id')
            .leftJoin('integrations as ti', 'sc.target_integration_id', 'ti.id')
            .leftJoin('notification_channels as nc', 'sc.notification_channel_id', 'nc.id')
            .select([
                // Campos da sync_configuration
                'sc.id',
                'sc.name',
                'sc.description',
                'sc.source_integration_id',
                'sc.target_integration_id',
                'sc.notification_channel_id',
                'sc.store_ids',
                'sc.schedule',
                'sc.options',
                'sc.active',
                'sc.created_at',
                'sc.updated_at',
                'sc.deleted_at',

                // Campos da source_integration
                'si.id as source_integration_id_full',
                'si.name as source_integration_name',
                'si.type as source_integration_type',
                'si.base_url as source_integration_base_url',
                'si.email as source_integration_email',
                'si.password as source_integration_password',
                'si.config as source_integration_config',
                'si.active as source_integration_active',
                'si.created_at as source_integration_created_at',
                'si.updated_at as source_integration_updated_at',
                'si.deleted_at as source_integration_deleted_at',

                // Campos da target_integration
                'ti.id as target_integration_id_full',
                'ti.name as target_integration_name',
                'ti.type as target_integration_type',
                'ti.base_url as target_integration_base_url',
                'ti.email as target_integration_email',
                'ti.password as target_integration_password',
                'ti.config as target_integration_config',
                'ti.active as target_integration_active',
                'ti.created_at as target_integration_created_at',
                'ti.updated_at as target_integration_updated_at',
                'ti.deleted_at as target_integration_deleted_at',

                // Campos da notification_channel
                'nc.id as notification_channel_id_full',
                'nc.name as notification_channel_name',
                'nc.type as notification_channel_type',
                'nc.config as notification_channel_config',
                'nc.active as notification_channel_active',
                'nc.created_at as notification_channel_created_at',
                'nc.updated_at as notification_channel_updated_at',
                'nc.deleted_at as notification_channel_deleted_at'
            ])
            .where('sc.id', '=', id)
            .where('sc.deleted_at', 'is', null)
            .executeTakeFirst();

        return result ? this.transformSyncConfigRow(result) : null;
    }

    /**
     * Transforma row do banco na estrutura esperada pelo frontend
     */
    private transformSyncConfigRow(row: any): any {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            source_integration_id: row.source_integration_id,
            target_integration_id: row.target_integration_id,
            notification_channel_id: row.notification_channel_id,
            store_ids: row.store_ids,
            schedule: row.schedule,
            options: row.options,
            active: row.active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,

            // Source Integration (pode ser null se não existir)
            source_integration: row.source_integration_id_full ? {
                id: row.source_integration_id_full,
                name: row.source_integration_name,
                type: row.source_integration_type,
                base_url: row.source_integration_base_url,
                email: row.source_integration_email,
                password: row.source_integration_password,
                config: row.source_integration_config,
                active: row.source_integration_active,
                created_at: row.source_integration_created_at,
                updated_at: row.source_integration_updated_at,
                deleted_at: row.source_integration_deleted_at
            } : null,

            // Target Integration (pode ser null se não existir)
            target_integration: row.target_integration_id_full ? {
                id: row.target_integration_id_full,
                name: row.target_integration_name,
                type: row.target_integration_type,
                base_url: row.target_integration_base_url,
                email: row.target_integration_email,
                password: row.target_integration_password,
                config: row.target_integration_config,
                active: row.target_integration_active,
                created_at: row.target_integration_created_at,
                updated_at: row.target_integration_updated_at,
                deleted_at: row.target_integration_deleted_at
            } : null,

            // Notification Channel (pode ser null se não existir)
            notification_channel: row.notification_channel_id_full ? {
                id: row.notification_channel_id_full,
                name: row.notification_channel_name,
                type: row.notification_channel_type,
                config: row.notification_channel_config,
                active: row.notification_channel_active,
                created_at: row.notification_channel_created_at,
                updated_at: row.notification_channel_updated_at,
                deleted_at: row.notification_channel_deleted_at
            } : null
        };
    }

    /**
     * Soft delete de uma configuração de sincronização
     */
    async deleteSyncConfiguration(id: number): Promise<void> {
        await db.updateTable('sync_configurations')
            .set({
                deleted_at: new Date(),
                updated_at: new Date()
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .execute();
    }
}

export const syncService = new SyncService();
