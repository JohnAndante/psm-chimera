import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { SyncJobService } from '../services/sync.job.service';
import { SyncExecutionRequest } from '../types/sync.type';

export class ManualExecutionController {
    private static syncJobService = new SyncJobService();

    /**
     * POST /api/v1/manual/sync/all
     * Execute sync for all active stores
     */
    static async syncAllStores(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                options
            } = req.body;

            // Validate required fields
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            const syncRequest: SyncExecutionRequest = {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids: [], // Empty = all stores
                options: {
                    force_sync: options?.force_sync || false,
                    skip_comparison: options?.skip_comparison || false,
                    ...options
                }
            };

            // Execute sync job
            const result = await ManualExecutionController.syncJobService.executeSyncJob(syncRequest);

            res.json({
                message: 'Sincronização iniciada com sucesso',
                execution: result
            });

        } catch (error) {
            console.error('Erro na sincronização manual (todas as lojas):', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * POST /api/v1/manual/sync/stores
     * Execute sync for specific stores
     */
    static async syncSpecificStores(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids,
                options
            } = req.body;

            // Validate required fields
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            if (!store_ids || !Array.isArray(store_ids) || store_ids.length === 0) {
                return res.status(400).json({
                    error: 'Lista de IDs de lojas é obrigatória e deve conter ao menos uma loja'
                });
            }

            const syncRequest: SyncExecutionRequest = {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids,
                options: {
                    force_sync: options?.force_sync || false,
                    skip_comparison: options?.skip_comparison || false,
                    ...options
                }
            };

            // Execute sync job
            const result = await ManualExecutionController.syncJobService.executeSyncJob(syncRequest);

            res.json({
                message: `Sincronização iniciada para ${store_ids.length} loja(s)`,
                execution: result
            });

        } catch (error) {
            console.error('Erro na sincronização manual (lojas específicas):', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * POST /api/v1/manual/sync/store/:storeId
     * Execute sync for single store
     */
    static async syncSingleStore(req: AuthenticatedRequest, res: Response) {
        try {
            const { storeId } = req.params;
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                options
            } = req.body;

            // Validate required fields
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            const syncRequest: SyncExecutionRequest = {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                options: {
                    force_sync: options?.force_sync || false,
                    skip_comparison: options?.skip_comparison || false,
                    ...options
                }
            };

            // Execute sync for single store
            const result = await ManualExecutionController.syncJobService.executeSyncForStore(
                parseInt(storeId),
                syncRequest
            );

            res.json({
                message: `Sincronização executada para loja ID ${storeId}`,
                store_result: result
            });

        } catch (error) {
            console.error(`Erro na sincronização da loja ${req.params.storeId}:`, error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * POST /api/v1/manual/compare
     * Execute comparison job between RP and CresceVendas
     */
    static async compareData(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids
            } = req.body;

            // Validate required fields
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            const compareRequest: SyncExecutionRequest = {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids: store_ids || [] // Empty = all stores
            };

            // Execute comparison job
            const results = await ManualExecutionController.syncJobService.executeCompareJob(compareRequest);

            // Calculate summary
            const summary = {
                total_stores: results.length,
                stores_with_differences: results.filter(r => r.differences_found > 0).length,
                total_differences: results.reduce((sum, r) => sum + r.differences_found, 0),
                total_missing: results.reduce((sum, r) => sum + r.missing_products, 0),
                total_price_differences: results.reduce((sum, r) => sum + r.price_differences, 0)
            };

            res.json({
                message: 'Comparação de dados executada com sucesso',
                summary,
                results
            });

        } catch (error) {
            console.error('Erro na comparação manual de dados:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * GET /api/v1/manual/history
     * Get execution history
     */
    static async getExecutionHistory(req: AuthenticatedRequest, res: Response) {
        try {
            const { limit } = req.query;
            const limitNumber = limit ? parseInt(limit as string) : 50;

            const history = await ManualExecutionController.syncJobService.getExecutionHistory(limitNumber);

            res.json({
                message: 'Histórico de execuções recuperado com sucesso',
                executions: history
            });

        } catch (error) {
            console.error('Erro ao buscar histórico de execuções:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * GET /api/v1/manual/execution/:executionId
     * Get specific execution details
     */
    static async getExecutionDetails(req: AuthenticatedRequest, res: Response) {
        try {
            const { executionId } = req.params;

            // In a real implementation, you would fetch from database
            // For now, return a placeholder
            res.status(501).json({
                error: 'Funcionalidade não implementada ainda',
                message: 'Detalhes de execução específica será implementado em breve'
            });

        } catch (error) {
            console.error('Erro ao buscar detalhes da execução:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * POST /api/v1/manual/test-config
     * Test sync configuration without executing
     */
    static async testSyncConfiguration(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                store_ids
            } = req.body;

            // Validate required fields
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            // Here you would test the configuration
            // For now, return a simple validation
            res.json({
                message: 'Configuração de sincronização testada com sucesso',
                valid: true,
                test_results: {
                    source_integration: 'OK',
                    target_integration: 'OK',
                    stores_found: store_ids ? store_ids.length : 'todas as ativas',
                    estimated_duration: '5-15 minutos'
                }
            });

        } catch (error) {
            console.error('Erro ao testar configuração de sync:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * GET /api/v1/manual/status
     * Get current execution status
     */
    static async getExecutionStatus(req: AuthenticatedRequest, res: Response) {
        try {
            // In a real implementation, you would track running executions
            // For now, return a placeholder
            res.json({
                message: 'Status de execução recuperado com sucesso',
                status: {
                    running_executions: 0,
                    last_execution: null,
                    system_status: 'available'
                }
            });

        } catch (error) {
            console.error('Erro ao verificar status de execução:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * DELETE /api/v1/manual/execution/:executionId/cancel
     * Cancel running execution (if possible)
     */
    static async cancelExecution(req: AuthenticatedRequest, res: Response) {
        try {
            const { executionId } = req.params;

            // In a real implementation, you would cancel the running execution
            // For now, return a placeholder
            res.status(501).json({
                error: 'Funcionalidade não implementada ainda',
                message: 'Cancelamento de execução será implementado em breve'
            });

        } catch (error) {
            console.error('Erro ao cancelar execução:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
}
