import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth.js';
import { syncService } from '../services/sync.service.js';
import { integrationService } from '../services/integration.service.js';

export class SyncController {

    /**
     * GET /api/v1/sync/configs
     * Lista todas as configurações de sync
     */
    static async getAllSyncConfigs(req: AuthenticatedRequest, res: Response) {
        syncService.getAllSyncConfigurations()
            .then(configs => {
                res.status(200).json({
                    success: true,
                    data: configs
                });
            })
            .catch(error => {
                console.error('Erro ao buscar configurações de sync:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            })
    }

    /**
     * GET /api/v1/sync/configs/:id
     * Busca configuração específica por ID
     */
    static async getSyncConfigById(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                error: 'ID da configuração inválido'
            });
        }

        syncService.getSyncConfigurationById(Number(id))
            .then(config => {
                if (!config) {
                    return res.status(404).json({
                        error: 'Configuração não encontrada'
                    });
                }

                res.status(200).json({
                    success: true,
                    data: config
                });
            })
            .catch(error => {
                console.error('Erro ao buscar configuração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * POST /api/v1/sync/configs
     * Cria nova configuração de sync
     */
    static async createSyncConfig(req: AuthenticatedRequest, res: Response) {
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

        const configData = {
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
        };

        syncService.createSyncConfiguration(configData)
            .then(config => {
                res.status(201).json({
                    success: true,
                    message: 'Configuração criada com sucesso',
                    data: config
                });
            })
            .catch(error => {
                console.error('Erro ao criar configuração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * PUT /api/v1/sync/configs/:id
     * Atualiza configuração existente
     */
    static async updateSyncConfig(req: AuthenticatedRequest, res: Response) {
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
        syncService.getSyncConfigurationById(Number(id))
            .then(async (existingConfig: any) => {
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
                const config = await syncService.update({
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
            })
            .catch(error => {
                console.error('Erro ao atualizar configuração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * DELETE /api/v1/sync/configs/:id
     * Remove configuração (soft delete)
     */
    static async deleteSyncConfig(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                error: 'ID da configuração inválido'
            });
        }

        // Verificar se existe e deletar usando o service
        syncService.getSyncConfigurationById(Number(id))
            .then((existingConfig: any) => {
                if (!existingConfig) {
                    return res.status(404).json({
                        error: 'Configuração não encontrada'
                    });
                }

                // Delegar soft delete para o service
                return syncService.deleteSyncConfiguration(Number(id))
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            message: 'Configuração removida com sucesso'
                        });
                    });
            })
            .catch(error => {
                console.error('Erro ao remover configuração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * POST /api/v1/sync/configs/:id/execute
     * Executa uma configuração específica
     */
    static async executeSyncConfig(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const { forceSync = false } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                error: 'ID da configuração inválido'
            });
        }

        // Buscar configuração
        syncService.getSyncConfigurationById(Number(id))
            .then(async config => {
                if (!config) {
                    return res.status(404).json({
                        error: 'Configuração não encontrada ou inativa'
                    });
                }

                // Executar sync usando a configuração
                const storeIds = Array.isArray(config.store_ids) ? config.store_ids : JSON.parse(config.store_ids as string);
                const options = typeof config.options === 'object' ? config.options : JSON.parse(config.options as string);

                const result = await syncService.executeSync({
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

            })
            .catch(error => {

                console.error('Erro ao executar configuração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            })
    }

    /**
     * POST /api/v1/sync/execute
     * Executa sincronização manual RP → CresceVendas
     */
    static async executeSync(req: AuthenticatedRequest, res: Response) {
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
                error: 'IDs das integrações source e target são obrigatórios'
            });
        }

        // Verificar se as integrações existem e estão ativas
        return Promise.all([
            integrationService.findById(source_integration_id),
            integrationService.findById(target_integration_id)
        ])
            .then(([sourceIntegration, targetIntegration]) => {
                if (!sourceIntegration) {
                    throw new Error('Integração source não encontrada');
                }

                if (!targetIntegration) {
                    throw new Error('Integração target não encontrada');
                }

                if (!sourceIntegration.active || !targetIntegration.active) {
                    throw new Error('Uma ou mais integrações estão inativas');
                }

                // Validar tipos de integração
                if (sourceIntegration.type !== 'RP') {
                    throw new Error('Integração source deve ser do tipo RP');
                }

                if (targetIntegration.type !== 'CRESCEVENDAS') {
                    throw new Error('Integração target deve ser do tipo CRESCEVENDAS');
                }

                // Executar sincronização
                return syncService.executeSync({
                    source_integration_id,
                    target_integration_id,
                    notification_channel_id,
                    store_ids,
                    options
                });
            })
            .then(result => {
                res.status(200).json({
                    message: 'Sincronização executada com sucesso',
                    result
                });
            })
            .catch(error => {
                console.error('Erro ao executar sincronização:', error);
                
                if (error.message.includes('não encontrada') || error.message.includes('inativas') || error.message.includes('deve ser do tipo')) {
                    const status = error.message.includes('não encontrada') ? 404 : 400;
                    return res.status(status).json({
                        error: error.message
                    });
                }
                
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }    /**
     * POST /api/v1/sync/execute/store/:storeId
     * Executa sincronização para loja específica
     */
    static async executeSyncForStore(req: AuthenticatedRequest, res: Response) {
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
        return syncService.executeSync({
            source_integration_id,
            target_integration_id,
            notification_channel_id,
            store_ids: [Number(storeId)],
            options
        })
            .then(result => {
                res.status(200).json({
                    message: `Sincronização iniciada para loja ${storeId}`,
                    execution: result
                });
            })
            .catch(error => {
                console.error('Erro ao executar sincronização da loja:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * GET /api/v1/sync/executions
     * Lista execuções de sincronização
     */
    static async getExecutions(req: AuthenticatedRequest, res: Response) {
        const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 50;

        return syncService.getExecutions(limit)
            .then(executions => {
                res.status(200).json({
                    message: 'Execuções recuperadas com sucesso',
                    executions
                });
            })
            .catch(error => {
                console.error('Erro ao buscar execuções:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    /**
     * GET /api/v1/sync/executions/:executionId
     * Busca execução específica por ID
     */
    static async getExecutionById(req: AuthenticatedRequest, res: Response) {
        const { executionId } = req.params;

        if (!executionId) {
            return res.status(400).json({
                error: 'ID da execução é obrigatório'
            });
        }

        return syncService.getExecutionById(executionId)
            .then(execution => {
                if (!execution) {
                    return res.status(404).json({
                        error: 'Execução não encontrada'
                    });
                }

                res.status(200).json({
                    message: 'Execução encontrada com sucesso',
                    execution
                });
            })
            .catch(error => {
                console.error('Erro ao buscar execução:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }    /**
     * POST /api/v1/sync/compare
     * Executa apenas comparação entre RP e CresceVendas
     */
    static async executeComparison(req: AuthenticatedRequest, res: Response) {
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
        return syncService.executeSync({
            source_integration_id,
            target_integration_id,
            store_ids,
            options: {
                skip_comparison: false // Força comparação
            }
        })
            .then(result => {
                res.status(200).json({
                    message: 'Comparação executada com sucesso',
                    comparison: result.comparison_results,
                    summary: result.summary
                });
            })
            .catch((error: any) => {
                console.error('Erro ao executar comparação:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            });
    }

    /**
     * GET /api/v1/sync/status
     * Obtém status geral do sistema de sincronização
     */
    static async getStatus(req: AuthenticatedRequest, res: Response) {
        return Promise.resolve()
            .then(() => {
                // TODO: Implementar método getStatus no SyncService
                const status = {
                    active_configurations: 0,
                    last_execution: null,
                    system_health: 'ok'
                };

                res.status(200).json({
                    message: 'Status recuperado com sucesso',
                    status
                });
            })
            .catch((error: any) => {
                console.error('Erro ao buscar status:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }
}
