import { db } from '../factory/database.factory.js';
import { RPIntegrationService } from './rp.integration.service.js';
import { CresceVendasIntegrationService } from './crescevendas.integration.service.js';
import { ProductService } from './product.service.js';
import { integrationService } from './integration.service.js';
import { notificationChannelService } from './notificationChannel.service.js';
import { getTelegramService } from './telegram.service.js';
import { SyncResult, SyncSummary } from './notification.template.service.js';
import {
    SyncExecutionRequest,
    SyncExecutionResult,
    SyncStatus,
    ComparisonResult,
    ProductComparison,
    DifferenceType
} from '../types/sync.type.js';
import { NotificationChannelType, TelegramConfig } from '../types/notification.type.js';

export class SyncService {

    /**
     * Executa sincronização RP → CresceVendas
     */
    static async executeSync(request: SyncExecutionRequest): Promise<SyncExecutionResult> {
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
                    const internalProducts = ProductService.parseRPProducts(rpProducts, store.id);

                    // Salvar no cache local (tabela products)
                    await ProductService.upsertProducts(store.id, internalProducts);
                    console.log(`[SYNC] ${internalProducts.length} produtos salvos no cache local`);

                    // ETAPA 2: Buscar produtos do cache e enviar para CresceVendas
                    const cachedProducts = await ProductService.getByStoreId(store.id, { active_only: true });
                    const cvProducts = ProductService.formatForCresceVendas(cachedProducts);

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
    private static async getStoresToSync(storeIds?: number[]): Promise<any[]> {
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
    private static async executeComparison(
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
                    ProductService.getByStoreId(store.id, { active_only: true }),
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
    private static async saveExecutionResult(result: SyncExecutionResult): Promise<void> {
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
    private static async sendStartNotification(
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
    private static async sendCompletionNotification(
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
    static async getExecutions(limit: number = 50): Promise<any[]> {
        return await db.selectFrom('sync_executions')
            .selectAll()
            .orderBy('started_at', 'desc')
            .limit(limit)
            .execute();
    }

    /**
     * Busca execução por ID
     */
    static async getExecutionById(executionId: string): Promise<any | null> {
        return await db.selectFrom('sync_executions')
            .selectAll()
            .where('id', '=', executionId)
            .executeTakeFirst();
    }
}
