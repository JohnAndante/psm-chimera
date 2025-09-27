import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { JobExecutionService } from '../services/job.execution.service';
import { notificationChannelService } from '../services/notificationChannel.service';

export class JobTestController {

    // POST /api/v1/jobs/execute
    static executeJob(req: AuthenticatedRequest, res: Response) {
        const {
            job_config_id,
            store_id,
            notification_channel_id,
            manual_trigger = true
        } = req.body;

        const executionRequest = {
            job_config_id: parseInt(job_config_id),
            store_id: store_id ? parseInt(store_id) : undefined,
            notification_channel_id: notification_channel_id ? parseInt(notification_channel_id) : undefined,
            manual_trigger,
            triggered_by: `user_${req.user?.id || 'unknown'}`
        };

        JobExecutionService.executeJob(executionRequest)
            .then(result => {
                res.json({
                    message: 'Job executado com sucesso',
                    data: result
                });
            })
            .catch(error => {
                console.error('Erro ao executar job:', error);

                if (error.message === 'Configuração de job não encontrada') {
                    return res.status(404).json({
                        error: 'Configuração de job não encontrada'
                    });
                }

                if (error.message === 'Configuração de job não está ativa') {
                    return res.status(400).json({
                        error: 'Configuração de job não está ativa'
                    });
                }

                res.status(500).json({
                    error: 'Erro interno do servidor ao executar job'
                });
            });
    }

    // GET /api/v1/jobs/executions/running
    static getRunningExecutions(req: AuthenticatedRequest, res: Response) {
        JobExecutionService.getRunningExecutions()
            .then(executions => {
                res.json({
                    message: executions.length > 0 ? 'Execuções em andamento encontradas' : 'Nenhuma execução em andamento',
                    data: executions
                });
            })
            .catch(error => {
                console.error('Erro ao buscar execuções em andamento:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar execuções'
                });
            });
    }

    // POST /api/v1/jobs/test-notification
    static testNotification(req: AuthenticatedRequest, res: Response) {
        const { notification_channel_id, message } = req.body;
        const channelId = parseInt(notification_channel_id);

        notificationChannelService.testNotification(channelId, message)
            .then(result => {
                res.json({
                    message: 'Teste de notificação realizado',
                    data: result
                });
            })
            .catch(error => {
                console.error('Erro ao testar notificação:', error);

                if (error.message === 'Canal de notificação não encontrado') {
                    return res.status(404).json({
                        error: 'Canal de notificação não encontrado'
                    });
                }

                if (error.message === 'Canal de notificação está inativo') {
                    return res.status(400).json({
                        error: 'Canal de notificação está inativo'
                    });
                }

                res.status(500).json({
                    error: 'Erro interno do servidor ao testar notificação'
                });
            });
    }

    // POST /api/v1/jobs/sync-store
    static syncStoreWithNotification(req: AuthenticatedRequest, res: Response) {
        const {
            store_id,
            notification_channel_id,
            force_sync = false
        } = req.body;

        const syncRequest = {
            store_id: parseInt(store_id),
            notification_channel_id: notification_channel_id ? parseInt(notification_channel_id) : undefined,
            force_sync
        };

        JobExecutionService.executeSyncJob(syncRequest)
            .then(result => {
                res.json({
                    message: 'Sincronização da loja iniciada com sucesso',
                    data: result
                });
            })
            .catch(error => {
                console.error('Erro ao sincronizar loja:', error);

                if (error.message === 'Loja não encontrada') {
                    return res.status(404).json({
                        error: 'Loja não encontrada'
                    });
                }

                if (error.message === 'Loja está inativa') {
                    return res.status(400).json({
                        error: 'Loja está inativa'
                    });
                }

                res.status(500).json({
                    error: 'Erro interno do servidor ao sincronizar loja'
                });
            });
    }

    // GET /api/v1/jobs/telegram/test-connection
    static testTelegramConnection(req: AuthenticatedRequest, res: Response) {
        const { notification_channel_id } = req.query;

        if (!notification_channel_id) {
            return res.status(400).json({
                error: 'ID do canal de notificação é obrigatório'
            });
        }

        const channelId = parseInt(notification_channel_id as string);

        notificationChannelService.getChannelById(channelId)
            .then(channel => {
                if (!channel) {
                    return res.status(404).json({
                        error: 'Canal de notificação não encontrado'
                    });
                }

                if (channel.type !== 'TELEGRAM') {
                    return res.status(400).json({
                        error: 'Canal deve ser do tipo Telegram'
                    });
                }

                // Testar conexão diretamente
                const { getTelegramService } = require('../services/telegram.service');
                const telegramService = getTelegramService(channel.config);

                telegramService.testConnection()
                    .then((result: any) => {
                        res.json({
                            message: 'Teste de conexão realizado',
                            data: {
                                channel_name: channel.name,
                                channel_id: channelId,
                                connection_test: result
                            }
                        });
                    })
                    .catch((error: any) => {
                        res.status(500).json({
                            error: 'Erro ao testar conexão Telegram',
                            details: error.message
                        });
                    });
            })
            .catch(error => {
                console.error('Erro ao buscar canal:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar canal'
                });
            });
    }
}
