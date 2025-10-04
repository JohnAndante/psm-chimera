import { db } from '../factory/database.factory';
import { ExecutionStatus } from '../types/database';
import { RPIntegrationService } from './rp.integration.service';
import { CresceVendasIntegrationService } from './crescevendas.integration.service';
import { TelegramService } from './telegram.service';
import {
    SyncExecutionRequest,
    SyncExecutionResult,
    ComparisonResult,
    JobExecutionResult,
    StoreResult
} from '../types/sync.type';
import { randomUUID } from 'crypto';

interface ProductData {
    id: string;
    code: number;
    price: number;
    final_price: number;
    limit: number;
    store_id: number;
    starts_at: string | null;
    expires_at: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export class SyncJobService {
    private rpService?: RPIntegrationService;
    private cresceVendasService?: CresceVendasIntegrationService;
    private telegramService?: TelegramService;

    constructor() {
        // Usando Kysely via factory
    }

    /**
     * Execute sync job based on configuration
     */
    public async executeSyncJob(request: SyncExecutionRequest): Promise<SyncExecutionResult> {
        const executionId = randomUUID();
        const startTime = new Date();

        try {
            // Initialize services based on integrations
            await this.initializeServices(request);

            // Get stores to process
            const stores = await this.getStoresToProcess(request.store_ids);

            if (stores.length === 0) {
                throw new Error('Nenhuma loja ativa encontrada para sincronização');
            }

            // Send start notification
            if (this.telegramService && request.notification_channel_id) {
                await this.sendStartNotification(stores.length);
            }

            // Process each store
            const storeResults: StoreResult[] = [];
            let totalProducts = 0;
            let successfulStores = 0;
            let failedStores = 0;

            for (const store of stores) {
                try {
                    const storeResult = await this.processSingleStore(store);
                    storeResults.push(storeResult);

                    if (storeResult.status === 'SUCCESS') {
                        successfulStores++;
                        totalProducts += storeResult.products_synced;
                    } else {
                        failedStores++;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                    storeResults.push({
                        store_id: store.id,
                        store_name: store.name,
                        products_synced: 0,
                        status: 'FAILED',
                        error: errorMessage,
                        execution_time: 0
                    });
                    failedStores++;
                }
            }

            const finishTime = new Date();
            const executionTime = finishTime.getTime() - startTime.getTime();

            const result: SyncExecutionResult = {
                execution_id: executionId,
                sync_config_id: request.sync_config_id,
                status: failedStores > 0 ? 'FAILED' : 'SUCCESS',
                started_at: startTime,
                finished_at: finishTime,
                stores_processed: storeResults.map(sr => ({
                    store_id: sr.store_id,
                    store_name: sr.store_name,
                    products_synced: sr.products_synced,
                    status: sr.status,
                    error: sr.error
                })),
                summary: {
                    total_stores: stores.length,
                    successful_stores: successfulStores,
                    failed_stores: failedStores,
                    total_products: totalProducts,
                    execution_time: executionTime
                }
            };

            // Send completion notification
            if (this.telegramService && request.notification_channel_id) {
                await this.sendCompletionNotification(result);
            }

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            const finishTime = new Date();
            const executionTime = finishTime.getTime() - startTime.getTime();

            const failedResult: SyncExecutionResult = {
                execution_id: executionId,
                sync_config_id: request.sync_config_id,
                status: 'FAILED',
                started_at: startTime,
                finished_at: finishTime,
                stores_processed: [],
                summary: {
                    total_stores: 0,
                    successful_stores: 0,
                    failed_stores: 0,
                    total_products: 0,
                    execution_time: executionTime
                }
            };

            if (this.telegramService && request.notification_channel_id) {
                await this.sendErrorNotification(errorMessage);
            }

            return failedResult;
        }
    }

    /**
     * Execute comparison job
     */
    public async executeCompareJob(request: SyncExecutionRequest): Promise<ComparisonResult[]> {
        try {
            await this.initializeServices(request);
            const stores = await this.getStoresToProcess(request.store_ids);

            const comparisonResults: ComparisonResult[] = [];

            for (const store of stores) {
                try {
                    const comparison = await this.compareStoreData(store);
                    comparisonResults.push(comparison);
                } catch (error) {
                    console.error(`Erro ao comparar dados da loja ${store.name}:`, error);
                }
            }

            // Send comparison notification
            if (this.telegramService && request.notification_channel_id) {
                await this.sendComparisonNotification(comparisonResults);
            }

            return comparisonResults;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro na comparação de dados:', errorMessage);
            throw error;
        }
    }

    /**
     * Execute sync for specific store
     */
    public async executeSyncForStore(storeId: number, request: SyncExecutionRequest): Promise<StoreResult> {
        try {
            await this.initializeServices(request);

            const store = await db
                .selectFrom('stores')
                .selectAll()
                .where('id', '=', storeId)
                .where('active', '=', true)
                .where('deleted_at', 'is', null)
                .executeTakeFirst();

            if (!store) {
                throw new Error(`Loja com ID ${storeId} não encontrada ou inativa`);
            }

            return await this.processSingleStore(store);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return {
                store_id: storeId,
                store_name: 'Desconhecida',
                products_synced: 0,
                status: 'FAILED',
                error: errorMessage,
                execution_time: 0
            };
        }
    }

    /**
     * Get sync execution history
     */
    public async getExecutionHistory(limit: number = 50): Promise<any[]> {
        return await db
            .selectFrom('sync_executions')
            .leftJoin('sync_configurations', 'sync_executions.sync_config_id', 'sync_configurations.id')
            .select([
                'sync_executions.id',
                'sync_executions.status',
                'sync_executions.started_at',
                'sync_executions.finished_at',
                'sync_executions.stores_processed',
                'sync_executions.summary',
                'sync_configurations.id as sync_config_id',
                'sync_configurations.name as sync_config_name'
            ])
            .orderBy('sync_executions.started_at', 'desc')
            .limit(limit)
            .execute();
    }

    // Private helper methods

    private async initializeServices(request: SyncExecutionRequest): Promise<void> {
        // Get integrations
        const sourceIntegration = await db
            .selectFrom('integrations')
            .leftJoin('integration_keys', 'integrations.id', 'integration_keys.integration_id')
            .select([
                'integrations.id',
                'integrations.type',
                'integrations.config',
                'integration_keys.key'
            ])
            .where('integrations.id', '=', request.source_integration_id)
            .where('integrations.deleted_at', 'is', null)
            .executeTakeFirst();

        const targetIntegration = await db
            .selectFrom('integrations')
            .leftJoin('integration_keys', 'integrations.id', 'integration_keys.integration_id')
            .select([
                'integrations.id',
                'integrations.type',
                'integrations.config',
                'integration_keys.key'
            ])
            .where('integrations.id', '=', request.target_integration_id)
            .where('integrations.deleted_at', 'is', null)
            .executeTakeFirst();

        if (!sourceIntegration || !targetIntegration) {
            throw new Error('Integrações não encontradas');
        }

        // Initialize RP service
        if (sourceIntegration.type === 'RP' && sourceIntegration.config) {
            this.rpService = new RPIntegrationService(sourceIntegration.config as any);
        }

        // Initialize CresceVendas service
        if (targetIntegration.type === 'CRESCEVENDAS' && targetIntegration.config) {
            this.cresceVendasService = new CresceVendasIntegrationService(targetIntegration.config as any);
        }

        // Initialize Telegram service if notification channel is provided
        if (request.notification_channel_id) {
            const notificationChannel = await db
                .selectFrom('notification_channels')
                .select(['id', 'type', 'config'])
                .where('id', '=', request.notification_channel_id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst();

            if (notificationChannel && notificationChannel.type === 'TELEGRAM') {
                this.telegramService = new TelegramService(notificationChannel.config as any);
            }
        }
    }

    private async getStoresToProcess(storeIds?: number[]): Promise<any[]> {
        let query = db
            .selectFrom('stores')
            .select([
                'id',
                'name',
                'registration',
                'document',
                'active'
            ])
            .where('active', '=', true)
            .where('deleted_at', 'is', null);

        if (storeIds && storeIds.length > 0) {
            query = query.where('id', 'in', storeIds);
        }

        return await query.execute();
    }

    private async processSingleStore(store: any): Promise<StoreResult> {
        const startTime = Date.now();

        try {
            if (!this.rpService || !this.cresceVendasService) {
                throw new Error('Serviços de integração não inicializados');
            }

            // 1. Get products from RP
            const rpProducts = await this.rpService.getProductsByStore(store.document || store.registration);

            if (!rpProducts || rpProducts.length === 0) {
                return {
                    store_id: store.id,
                    store_name: store.name,
                    products_synced: 0,
                    status: 'SKIPPED',
                    error: 'Nenhum produto com desconto encontrado',
                    execution_time: Date.now() - startTime
                };
            }

            // 2. Clear old products from local database
            await db
                .deleteFrom('products')
                .where('store_id', '=', store.id)
                .execute();

            // 3. Save products to local database
            const parsedProducts = this.parseRPProducts(rpProducts, store.id);
            const createdProductsResult = await db
                .insertInto('products')
                .values(parsedProducts)
                .execute();
            
            const createdProducts = { count: createdProductsResult.length };

            // 4. Send products to CresceVendas
            const cresceVendasProducts = CresceVendasIntegrationService.parseProducts(parsedProducts);
            const sendResult = await this.cresceVendasService.sendProducts(
                store.registration,
                cresceVendasProducts
            );

            if (sendResult.error) {
                throw new Error(`Erro ao enviar produtos para CresceVendas: ${sendResult.error}`);
            }

            return {
                store_id: store.id,
                store_name: store.name,
                products_synced: createdProducts.count,
                status: 'SUCCESS',
                execution_time: Date.now() - startTime
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return {
                store_id: store.id,
                store_name: store.name,
                products_synced: 0,
                status: 'FAILED',
                error: errorMessage,
                execution_time: Date.now() - startTime
            };
        }
    }

    private async compareStoreData(store: any): Promise<ComparisonResult> {
        try {
            if (!this.cresceVendasService) {
                throw new Error('Serviço CresceVendas não inicializado');
            }

            // Get local products
            const localProducts = await db
                .selectFrom('products')
                .selectAll()
                .where('store_id', '=', store.id)
                .where('deleted_at', 'is', null)
                .execute();

            // Get CresceVendas products
            const cresceVendasResponse = await this.cresceVendasService.getActiveProducts(store.registration);

            if (!cresceVendasResponse?.response?.discounts) {
                return {
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
                };
            }

            const cresceVendasProducts = cresceVendasResponse.response.discounts.map((product: any) => ({
                code: Number(product.code),
                price: Number(product.price),
                final_price: Number(product.final_price),
                limit: Number(product.limit),
                start_at: product.start_at,
                expire_at: product.expire_at
            }));

            // Compare products
            const missing: any[] = [];
            const priceDiff: any[] = [];
            const statusDiff: any[] = [];

            for (const localProduct of localProducts) {
                const cresceVendasProduct = cresceVendasProducts.find(
                    (p: any) => p.code === localProduct.code
                );

                if (!cresceVendasProduct) {
                    missing.push({
                        product_code: localProduct.code.toString(),
                        rp_data: {
                            price: localProduct.price,
                            final_price: localProduct.final_price,
                            active: true
                        },
                        difference_type: 'MISSING'
                    });
                } else {
                    // Check price differences
                    if (cresceVendasProduct.price !== localProduct.price ||
                        cresceVendasProduct.final_price !== localProduct.final_price) {
                        priceDiff.push({
                            product_code: localProduct.code.toString(),
                            rp_data: {
                                price: localProduct.price,
                                final_price: localProduct.final_price,
                                active: true
                            },
                            crescevendas_data: {
                                price: cresceVendasProduct.price,
                                final_price: cresceVendasProduct.final_price,
                                active: true
                            },
                            difference_type: 'PRICE_DIFF'
                        });
                    }
                }
            }

            return {
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
            };

        } catch (error) {
            console.error(`Erro ao comparar dados da loja ${store.name}:`, error);
            return {
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
            };
        }
    }

    private parseRPProducts(rpProducts: any[], storeId: number): ProductData[] {
        const now = new Date();
        return rpProducts.map(product => ({
            id: randomUUID(),
            code: product.codigo || product.code,
            price: product.preco || product.price,
            final_price: product.precoVenda2 || product.final_price,
            limit: 1000,
            store_id: storeId,
            starts_at: `${now.toISOString().slice(0, 10)}T06:00:00.000Z`,
            expires_at: `${now.toISOString().slice(0, 10)}T23:59:59.000Z`,
            created_at: now,
            updated_at: now,
            deleted_at: null
        }));
    }

    private async createSyncExecution(executionId: string, request: SyncExecutionRequest, startTime: Date): Promise<void> {
        await db
            .insertInto('sync_executions')
            .values({
                id: executionId,
                sync_config_id: request.sync_config_id || null,
                status: 'RUNNING' as ExecutionStatus,
                started_at: startTime,
                finished_at: null,
                stores_processed: JSON.stringify([]),
                summary: JSON.stringify({}),
                comparison_results: null,
                execution_logs: `Iniciando sincronização às ${startTime.toISOString()}`,
                error_details: null,
                created_at: new Date()
            })
            .execute();
    }

    private async updateSyncExecution(executionId: string, result: SyncExecutionResult, error?: string): Promise<void> {
        await db
            .updateTable('sync_executions')
            .set({
                status: (result.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED') as ExecutionStatus,
                finished_at: result.finished_at || null,
                stores_processed: JSON.stringify(result.stores_processed),
                summary: JSON.stringify(result.summary),
                error_details: error ? JSON.stringify({ error }) : null
            })
            .where('id', '=', executionId)
            .execute();
    }

    // Notification methods
    private async sendStartNotification(storeCount: number): Promise<void> {
        if (!this.telegramService) return;

        const message = `🚀 Iniciando sincronização de produtos\n\n` +
            `🏪 Lojas a processar: ${storeCount}\n` +
            `⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `Status será enviado ao final do processo.`;

        await this.telegramService.sendMessage(message);
    }

    private async sendCompletionNotification(result: SyncExecutionResult): Promise<void> {
        if (!this.telegramService) return;

        const status = result.status === 'SUCCESS' ? '✅' : '❌';
        const message = `${status} Sincronização finalizada\n\n` +
            `📊 Resumo:\n` +
            `• Total de lojas: ${result.summary.total_stores}\n` +
            `• Sucessos: ${result.summary.successful_stores}\n` +
            `• Falhas: ${result.summary.failed_stores}\n` +
            `• Produtos sincronizados: ${result.summary.total_products}\n` +
            `• Tempo de execução: ${Math.round(result.summary.execution_time / 1000)}s\n\n` +
            `🕐 Finalizado às ${result.finished_at?.toLocaleString('pt-BR')}`;

        await this.telegramService.sendMessage(message);
    }

    private async sendErrorNotification(error: string): Promise<void> {
        if (!this.telegramService) return;

        const message = `❌ Erro na sincronização\n\n` +
            `🚨 Erro: ${error}\n\n` +
            `🕐 Horário: ${new Date().toLocaleString('pt-BR')}`;

        await this.telegramService.sendMessage(message);
    }

    private async sendComparisonNotification(results: ComparisonResult[]): Promise<void> {
        if (!this.telegramService) return;

        const totalDifferences = results.reduce((sum, r) => sum + r.differences_found, 0);
        const totalMissing = results.reduce((sum, r) => sum + r.missing_products, 0);
        const totalPriceDiff = results.reduce((sum, r) => sum + r.price_differences, 0);

        const message = `📊 Comparação de dados finalizada\n\n` +
            `🔍 Resumo geral:\n` +
            `• Lojas analisadas: ${results.length}\n` +
            `• Total de diferenças: ${totalDifferences}\n` +
            `• Produtos ausentes: ${totalMissing}\n` +
            `• Diferenças de preço: ${totalPriceDiff}\n\n` +
            `🕐 ${new Date().toLocaleString('pt-BR')}`;

        await this.telegramService.sendMessage(message);
    }

    /**
     * Close database connection - Kysely connections are managed by the factory
     */
    public async disconnect(): Promise<void> {
        // Kysely connections are managed by the database factory
        // No explicit disconnect needed
    }
}
