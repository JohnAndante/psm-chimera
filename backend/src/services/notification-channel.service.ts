import { db } from '../factory/database.factory';
import { getTelegramService } from './telegram.service';
import {
    NotificationChannelData,
    CreateNotificationChannelData,
    UpdateNotificationChannelData,
    NotificationChannelWithJobs,
    NotificationTestResult,
    NotificationChannelType,
    TelegramConfig,
    EmailConfig,
    WebhookConfig,
    NotificationsChannelsListData
} from '../types/notification.type';
import { FilterResult, PaginationResult } from '../types/query.type';
import { applyFilters, applyPagination, applySorting } from '../utils/query-builder.helper';

class NotificationChannelService {

    getAllChannels(filters: FilterResult, pagination: PaginationResult, sorting?: Record<string, 'asc' | 'desc'>): Promise<NotificationsChannelsListData> {
        const columnMapping = {
            'name': 'notification_channels.name',
            'type': 'notification_channels.type',
            'active': 'notification_channels.active',
            'createdAt': 'notification_channels.created_at'
        };

        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('notification_channels')
                .select([
                    'notification_channels.id',
                    'notification_channels.name',
                    'notification_channels.type',
                    'notification_channels.config',
                    'notification_channels.active',
                    'notification_channels.created_at',
                    'notification_channels.updated_at',
                ])
                .where('notification_channels.deleted_at', 'is', null);

            // Aplicar filtros
            query = applyFilters({
                query,
                filters,
                columnMapping
            });

            // Aplicar ordenação
            query = applySorting(
                query,
                sorting || { createdAt: 'asc' },
                columnMapping
            );

            // Count query para total
            let countQuery = db
                .selectFrom('notification_channels')
                .select(db.fn.countAll().as('total'))
                .where('notification_channels.deleted_at', 'is', null);

            // Aplicar mesmos filtros na contagem
            countQuery = applyFilters({
                query: countQuery,
                filters,
                columnMapping
            });

            // Aplica paginação
            query = applyPagination(query, pagination);

            // Executar ambas as queries em paralelo
            Promise.all([
                query.execute(),
                countQuery.executeTakeFirst()
            ])
                .then(([data, countResult]: [any[], any]) => {
                    const total = countResult ? parseInt(countResult.total, 10) : 0;

                    resolve({ data, total });
                })
                .catch(reject);
        });
    }

    getChannelById(id: number): Promise<NotificationChannelWithJobs | null> {
        return new Promise((resolve, reject) => {
            // Buscar canal
            const channelQuery = db
                .selectFrom('notification_channels')
                .select([
                    'id',
                    'name',
                    'type',
                    'config',
                    'active',
                    'created_at as createdAt',
                    'updated_at as updatedAt'
                ])
                .where('notification_channels.id', '=', id)
                .where('notification_channels.deleted_at', 'is', null)
                .executeTakeFirst();

            // Buscar jobs associados
            const jobsQuery = db
                .selectFrom('job_notifications')
                .leftJoin('job_configurations', 'job_notifications.job_config_id', 'job_configurations.id')
                .select([
                    'job_notifications.job_config_id',
                    'job_configurations.id as job_id',
                    'job_configurations.name as job_name',
                    'job_configurations.active as job_active',
                    'job_configurations.cron_pattern'
                ])
                .where('job_notifications.notification_channel_id', '=', id)
                .where('job_configurations.deleted_at', 'is', null)
                .execute();

            Promise.all([channelQuery, jobsQuery])
                .then(([channel, jobNotifications]: [any, any[]]) => {
                    if (!channel) {
                        resolve(null);
                        return;
                    }

                    const result: NotificationChannelWithJobs = {
                        ...channel,
                        job_notifications: jobNotifications.map(jn => ({
                            job_config_id: jn.job_config_id,
                            job_config: {
                                id: jn.job_id,
                                name: jn.job_name,
                                active: jn.job_active,
                                cron_pattern: jn.cron_pattern
                            }
                        }))
                    };

                    resolve(result);
                })
                .catch(reject);
        });
    }

    createChannel(data: CreateNotificationChannelData): Promise<NotificationChannelData> {
        return new Promise((resolve, reject) => {
            const channelData = {
                name: data.name,
                type: data.type,
                config: data.config,
                active: data.active !== undefined ? data.active : true,
                created_at: new Date(),
                updated_at: new Date()
            };

            db
                .insertInto('notification_channels')
                .values(channelData as any)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then((newChannel: any) => {
                    resolve(newChannel);
                })
                .catch(reject);
        });
    }

    checkNameExists(name: string, excludeId?: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('notification_channels')
                .select('id')
                .where('name', '=', name)
                .where('deleted_at', 'is', null);

            if (excludeId !== undefined) {
                query = query.where('id', '!=', excludeId);
            }

            query
                .executeTakeFirst()
                .then((result: any) => resolve(!!result))
                .catch(reject);
        });
    }

    updateChannel(id: number, data: UpdateNotificationChannelData): Promise<NotificationChannelData> {
        return new Promise((resolve, reject) => {
            const updateData: any = {
                updated_at: new Date()
            };

            if (data.name !== undefined) updateData.name = data.name;
            if (data.type !== undefined) updateData.type = data.type;
            if (data.config !== undefined) updateData.config = data.config;
            if (data.active !== undefined) updateData.active = data.active;

            db
                .updateTable('notification_channels')
                .set(updateData)
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then((updatedChannel: any) => {
                    resolve(updatedChannel);
                })
                .catch(reject);
        });
    }

    deleteChannel(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            db
                .updateTable('notification_channels')
                .set({
                    deleted_at: new Date(),
                    active: false,
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    checkChannelHasLinkedJobs(id: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('job_notifications')
                .select('notification_channel_id')
                .where('notification_channel_id', '=', id)
                .executeTakeFirst()
                .then((result: any) => resolve(!!result))
                .catch(reject);
        });
    }

    testNotification(id: number, message: string = 'Teste de notificação do PSM Chimera', customChatId?: string): Promise<NotificationTestResult> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('notification_channels')
                .select(['id', 'name', 'type', 'config', 'active'])
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((channel: any) => {
                    if (!channel) {
                        reject(new Error('Canal de notificação não encontrado'));
                        return;
                    }

                    if (!channel.active) {
                        reject(new Error('Canal de notificação está inativo'));
                        return;
                    }

                    // Implementar envio real de notificações
                    switch (channel.type) {
                        case NotificationChannelType.TELEGRAM:
                            const telegramConfig = channel.config as TelegramConfig;
                            const telegramService = getTelegramService(telegramConfig);

                            // Use chat_id customizado se fornecido, senão use o do canal
                            const targetChatId = customChatId || telegramConfig.chat_id;

                            telegramService.sendTestNotification(message, targetChatId)
                                .then(result => {
                                    const testResult: NotificationTestResult = {
                                        success: result.success,
                                        message: result.success ? 'Teste de notificação enviado com sucesso via Telegram' : 'Falha ao enviar notificação via Telegram',
                                        channel_name: channel.name,
                                        channel_type: channel.type,
                                        sent_at: new Date().toISOString(),
                                        details: {
                                            chat_id: targetChatId,
                                            original_chat_id: telegramConfig?.chat_id || 'Não configurado',
                                            custom_chat_used: !!customChatId,
                                            bot_configured: !!telegramConfig?.bot_token,
                                            message_id: result.message_id,
                                            error: result.error
                                        }
                                    };
                                    resolve(testResult);
                                })
                                .catch(error => {
                                    const targetChatId = customChatId || telegramConfig.chat_id;
                                    const testResult: NotificationTestResult = {
                                        success: false,
                                        message: 'Erro ao testar notificação via Telegram',
                                        channel_name: channel.name,
                                        channel_type: channel.type,
                                        sent_at: new Date().toISOString(),
                                        details: {
                                            chat_id: targetChatId,
                                            original_chat_id: telegramConfig?.chat_id || 'Não configurado',
                                            custom_chat_used: !!customChatId,
                                            bot_configured: !!telegramConfig?.bot_token,
                                            error: error.message || 'Erro desconhecido'
                                        }
                                    };
                                    resolve(testResult);
                                });
                            break;

                        case NotificationChannelType.EMAIL:
                            // TODO: Implementar envio real por email
                            const emailConfig = channel.config as EmailConfig;
                            const emailResult: NotificationTestResult = {
                                success: false,
                                message: 'Envio por email ainda não implementado',
                                channel_name: channel.name,
                                channel_type: channel.type,
                                sent_at: new Date().toISOString(),
                                details: {
                                    smtp_host: emailConfig?.smtp_host || 'Não configurado',
                                    from_email: emailConfig?.from_email || 'Não configurado'
                                }
                            };
                            resolve(emailResult);
                            break;

                        case NotificationChannelType.WEBHOOK:
                            // TODO: Implementar envio real por webhook
                            const webhookConfig = channel.config as WebhookConfig;
                            const webhookResult: NotificationTestResult = {
                                success: false,
                                message: 'Envio por webhook ainda não implementado',
                                channel_name: channel.name,
                                channel_type: channel.type,
                                sent_at: new Date().toISOString(),
                                details: {
                                    webhook_url: webhookConfig?.webhook_url || 'Não configurado',
                                    method: webhookConfig?.method || 'POST'
                                }
                            };
                            resolve(webhookResult);
                            break;

                        default:
                            reject(new Error('Tipo de canal não suportado'));
                    }
                })
                .catch(reject);
        });
    }
}


export const notificationChannelService = new NotificationChannelService();
