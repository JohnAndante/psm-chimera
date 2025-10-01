import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth.js';
import { SyncService } from '../services/sync.service.js';
import { integrationService } from '../services/integration.service.js';
import { PrismaClient } from '../../database/generated/prisma';

const db = new PrismaClient();

export class SyncController {

    /**
     * GET /api/v1/sync/configs
     * Lista todas as configurações de sync
     */
    static async getAllSyncConfigs(req: AuthenticatedRequest, res: Response) {
        try {
            const configs = await db.syncConfiguration.findMany({
                where: {
                    deleted_at: null
                },
                include: {
                    source_integration: true,
                    target_integration: true,
                    notification_channel: true
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            res.status(200).json({
                success: true,
                data: configs
            });

        } catch (error: any) {
            console.error('Erro ao buscar configurações de sync:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * GET /api/v1/sync/configs/:id
     * Busca configuração específica por ID
     */
    static async getSyncConfigById(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID da configuração inválido'
                });
            }

            const config = await db.syncConfiguration.findFirst({
                where: {
                    id: Number(id),
                    deleted_at: null
                },
                include: {
                    source_integration: true,
                    target_integration: true,
                    notification_channel: true
                }
            });

            if (!config) {
                return res.status(404).json({
                    error: 'Configuração não encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: config
            });

        } catch (error: any) {
            console.error('Erro ao buscar configuração:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * POST /api/v1/sync/configs
     * Cria nova configuração de sync
     */
    static async createSyncConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                name,
                description,
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids = [],
                schedule_enabled = false,
                schedule_cron,
                options = {}
            } = req.body;

            // Validações básicas
            if (!name || !source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'Nome e IDs das integrações são obrigatórios'
                });
            }

            // Verificar se as integrações existem
            const [sourceIntegration, targetIntegration] = await Promise.all([
                integrationService.findById(source_integration_id),
                integrationService.findById(target_integration_id)
            ]);

            if (!sourceIntegration || !targetIntegration) {
                return res.status(404).json({
                    error: 'Uma ou mais integrações não foram encontradas'
                });
            }

            // Criar configuração
            const config = await db.syncConfiguration.create({
                data: {
                    name,
                    description,
                    source_integration_id,
                    target_integration_id,
                    notification_channel_id,
                    store_ids: store_ids,
                    schedule: schedule_enabled && schedule_cron ?
                        {
                            enabled: true,
                            cron: schedule_cron
                        } : undefined,
                    options: options,
                    active: true
                },
                include: {
                    source_integration: true,
                    target_integration: true,
                    notification_channel: true
                }
            });

            res.status(201).json({
                success: true,
                message: 'Configuração criada com sucesso',
                data: config
            });

        } catch (error: any) {
            console.error('Erro ao criar configuração:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * PUT /api/v1/sync/configs/:id
     * Atualiza configuração existente
     */
    static async updateSyncConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const {
                name,
                description,
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids,
                schedule_enabled,
                schedule_cron,
                options
            } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID da configuração inválido'
                });
            }

            // Verificar se existe
            const existingConfig = await db.syncConfiguration.findFirst({
                where: {
                    id: Number(id),
                    deleted_at: null
                }
            });

            if (!existingConfig) {
                return res.status(404).json({
                    error: 'Configuração não encontrada'
                });
            }

            // Preparar dados para atualização
            const updateData: any = {};

            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (source_integration_id !== undefined) updateData.source_integration_id = source_integration_id;
            if (target_integration_id !== undefined) updateData.target_integration_id = target_integration_id;
            if (notification_channel_id !== undefined) updateData.notification_channel_id = notification_channel_id;
            if (store_ids !== undefined) updateData.store_ids = store_ids;
            if (options !== undefined) updateData.options = options;

            if (schedule_enabled !== undefined || schedule_cron !== undefined) {
                updateData.schedule = schedule_enabled && schedule_cron ?
                    {
                        enabled: true,
                        cron: schedule_cron
                    } : undefined;
            }

            // Atualizar
            const config = await db.syncConfiguration.update({
                where: { id: Number(id) },
                data: updateData,
                include: {
                    source_integration: true,
                    target_integration: true,
                    notification_channel: true
                }
            });

            res.status(200).json({
                success: true,
                message: 'Configuração atualizada com sucesso',
                data: config
            });

        } catch (error: any) {
            console.error('Erro ao atualizar configuração:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * DELETE /api/v1/sync/configs/:id
     * Remove configuração (soft delete)
     */
    static async deleteSyncConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID da configuração inválido'
                });
            }

            // Verificar se existe
            const existingConfig = await db.syncConfiguration.findFirst({
                where: {
                    id: Number(id),
                    deleted_at: null
                }
            });

            if (!existingConfig) {
                return res.status(404).json({
                    error: 'Configuração não encontrada'
                });
            }

            // Soft delete
            await db.syncConfiguration.update({
                where: { id: Number(id) },
                data: {
                    deleted_at: new Date()
                }
            });

            res.status(200).json({
                success: true,
                message: 'Configuração removida com sucesso'
            });

        } catch (error: any) {
            console.error('Erro ao remover configuração:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * POST /api/v1/sync/configs/:id/execute
     * Executa uma configuração específica
     */
    static async executeSyncConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { forceSync = false } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID da configuração inválido'
                });
            }

            // Buscar configuração
            const config = await db.syncConfiguration.findFirst({
                where: {
                    id: Number(id),
                    deleted_at: null,
                    active: true
                }
            });

            if (!config) {
                return res.status(404).json({
                    error: 'Configuração não encontrada ou inativa'
                });
            }

            // Executar sync usando a configuração
            const storeIds = Array.isArray(config.store_ids) ? config.store_ids : JSON.parse(config.store_ids as string);
            const options = typeof config.options === 'object' ? config.options : JSON.parse(config.options as string);

            const result = await SyncService.executeSync({
                source_integration_id: config.source_integration_id,
                target_integration_id: config.target_integration_id,
                notification_channel_id: config.notification_channel_id || undefined,
                store_ids: storeIds,
                options: { ...options, force_sync: forceSync }
            });

            res.status(200).json({
                success: true,
                message: 'Configuração executada com sucesso',
                data: result
            });

        } catch (error: any) {
            console.error('Erro ao executar configuração:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * POST /api/v1/sync/execute
     * Executa sincronização manual RP → CresceVendas
     */
    static async executeSync(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids,
                options = {}
            } = req.body;

            // Validar integrações obrigatórias
            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações de origem e destino são obrigatórios'
                });
            }

            // Verificar se as integrações existem e estão ativas
            const [sourceIntegration, targetIntegration] = await Promise.all([
                integrationService.findById(source_integration_id),
                integrationService.findById(target_integration_id)
            ]);

            if (!sourceIntegration) {
                return res.status(404).json({
                    error: 'Integração de origem não encontrada'
                });
            }

            if (!targetIntegration) {
                return res.status(404).json({
                    error: 'Integração de destino não encontrada'
                });
            }

            if (!sourceIntegration.active || !targetIntegration.active) {
                return res.status(400).json({
                    error: 'Uma ou mais integrações estão inativas'
                });
            }

            // Validar tipos de integração
            if (sourceIntegration.type !== 'RP') {
                return res.status(400).json({
                    error: 'Integração de origem deve ser do tipo RP'
                });
            }

            if (targetIntegration.type !== 'CRESCEVENDAS') {
                return res.status(400).json({
                    error: 'Integração de destino deve ser do tipo CRESCEVENDAS'
                });
            }

            // Executar sincronização
            const result = await SyncService.executeSync({
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids,
                options
            });

            res.status(200).json({
                message: 'Sincronização iniciada com sucesso',
                execution: result
            });

        } catch (error: any) {
            console.error('Erro ao executar sincronização:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * POST /api/v1/sync/execute/store/:storeId
     * Executa sincronização para loja específica
     */
    static async executeSyncForStore(req: AuthenticatedRequest, res: Response) {
        try {
            const { storeId } = req.params;
            const {
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                options = {}
            } = req.body;

            if (!storeId || isNaN(Number(storeId))) {
                return res.status(400).json({
                    error: 'ID da loja inválido'
                });
            }

            // Executar sincronização para loja específica
            const result = await SyncService.executeSync({
                source_integration_id,
                target_integration_id,
                notification_channel_id,
                store_ids: [Number(storeId)],
                options
            });

            res.status(200).json({
                message: `Sincronização iniciada para loja ${storeId}`,
                execution: result
            });

        } catch (error: any) {
            console.error('Erro ao executar sincronização da loja:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * GET /api/v1/sync/executions
     * Lista execuções de sincronização
     */
    static async getExecutions(req: AuthenticatedRequest, res: Response) {
        try {
            const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 50;

            const executions = await SyncService.getExecutions(limit);

            res.status(200).json({
                message: 'Execuções recuperadas com sucesso',
                executions
            });

        } catch (error: any) {
            console.error('Erro ao buscar execuções:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /api/v1/sync/executions/:executionId
     * Busca execução específica por ID
     */
    static async getExecutionById(req: AuthenticatedRequest, res: Response) {
        try {
            const { executionId } = req.params;

            if (!executionId) {
                return res.status(400).json({
                    error: 'ID da execução é obrigatório'
                });
            }

            const execution = await SyncService.getExecutionById(executionId);

            if (!execution) {
                return res.status(404).json({
                    error: 'Execução não encontrada'
                });
            }

            res.status(200).json({
                message: 'Execução recuperada com sucesso',
                execution
            });

        } catch (error: any) {
            console.error('Erro ao buscar execução:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /api/v1/sync/compare
     * Executa apenas comparação entre RP e CresceVendas
     */
    static async executeComparison(req: AuthenticatedRequest, res: Response) {
        try {
            const {
                source_integration_id,
                target_integration_id,
                store_ids
            } = req.body;

            if (!source_integration_id || !target_integration_id) {
                return res.status(400).json({
                    error: 'IDs das integrações são obrigatórios'
                });
            }

            // Executar sincronização apenas com comparação (skip sync)
            const result = await SyncService.executeSync({
                source_integration_id,
                target_integration_id,
                store_ids,
                options: {
                    skip_comparison: false // Força comparação
                }
            });

            res.status(200).json({
                message: 'Comparação executada com sucesso',
                comparison: result.comparison_results,
                summary: result.summary
            });

        } catch (error: any) {
            console.error('Erro ao executar comparação:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    /**
     * GET /api/v1/sync/status
     * Status geral do sistema de sync
     */
    static async getStatus(req: AuthenticatedRequest, res: Response) {
        try {
            // Buscar integrações ativas
            const integrations = await integrationService.findAll();
            const rpIntegrations = integrations.filter((i: any) => i.type === 'RP' && i.active);
            const cvIntegrations = integrations.filter((i: any) => i.type === 'CRESCEVENDAS' && i.active);

            // Buscar últimas execuções (comentado até criar a tabela)
            // const recentExecutions = await SyncService.getExecutions(5);

            const status = {
                system_ready: rpIntegrations.length > 0 && cvIntegrations.length > 0,
                integrations: {
                    rp_available: rpIntegrations.length,
                    crescevendas_available: cvIntegrations.length
                },
                // recent_executions: recentExecutions,
                timestamp: new Date()
            };

            res.status(200).json({
                message: 'Status do sistema recuperado',
                status
            });

        } catch (error: any) {
            console.error('Erro ao buscar status:', error);
            res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}
