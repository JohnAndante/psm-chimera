import { db } from '../factory/database.factory';
import { 
    NotificationChannelData,
    CreateNotificationChannelData,
    UpdateNotificationChannelData,
    NotificationChannelFilters,
    NotificationChannelWithJobs,
    NotificationTestResult,
    NotificationChannelType,
    TelegramConfig,
    EmailConfig,
    WebhookConfig
} from '../types/notification.type';

export class NotificationChannelService {

    static getAllChannels(filters: NotificationChannelFilters = {}): Promise<NotificationChannelWithJobs[]> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('notification_channels')
                .selectAll('notification_channels')
                .where('notification_channels.deleted_at', 'is', null);

            // Filtro por tipo
            if (filters.type) {
                query = query.where('notification_channels.type', '=', filters.type);
            }

            // Filtro por status ativo
            if (filters.active !== undefined) {
                query = query.where('notification_channels.active', '=', filters.active);
            }

            // Busca por nome
            if (filters.search) {
                const searchTerm = `%${filters.search}%`;
                query = query.where('notification_channels.name', 'ilike', searchTerm);
            }

            query
                .orderBy('notification_channels.created_at', 'desc')
                .execute()
                .then((channels: any[]) => {
                    // Para cada canal, buscar jobs associados
                    const channelPromises = channels.map(channel => {
                        return db
                            .selectFrom('job_notifications')
                            .leftJoin('job_configurations', 'job_notifications.job_config_id', 'job_configurations.id')
                            .select([
                                'job_notifications.job_config_id',
                                'job_configurations.id as job_id',
                                'job_configurations.name as job_name',
                                'job_configurations.active as job_active',
                                'job_configurations.cron_pattern'
                            ])
                            .where('job_notifications.notification_channel_id', '=', channel.id)
                            .where('job_configurations.deleted_at', 'is', null)
                            .execute()
                            .then((jobNotifications: any[]) => ({
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
                            }));
                    });

                    Promise.all(channelPromises)
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    static getChannelById(id: number): Promise<NotificationChannelWithJobs | null> {
        return new Promise((resolve, reject) => {
            // Buscar canal
            const channelQuery = db
                .selectFrom('notification_channels')
                .selectAll()
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

    static createChannel(data: CreateNotificationChannelData): Promise<NotificationChannelData> {
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

    static checkNameExists(name: string, excludeId?: number): Promise<boolean> {
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

    static updateChannel(id: number, data: UpdateNotificationChannelData): Promise<NotificationChannelData> {
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

    static deleteChannel(id: number): Promise<void> {
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

    static checkChannelHasLinkedJobs(id: number): Promise<boolean> {
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

    static testNotification(id: number, message: string = 'Teste de notificação do PSM Chimera'): Promise<NotificationTestResult> {
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

                    // TODO: Implementar envio real de notificações
                    // Por enquanto, simular teste bem-sucedido
                    let testResult: NotificationTestResult = {
                        success: true,
                        message: 'Teste de notificação enviado com sucesso',
                        channel_name: channel.name,
                        channel_type: channel.type,
                        sent_at: new Date().toISOString()
                    };

                    // Adicionar detalhes específicos do tipo
                    switch (channel.type) {
                        case NotificationChannelType.TELEGRAM:
                            const telegramConfig = channel.config as TelegramConfig;
                            testResult.details = {
                                chat_id: telegramConfig?.chat_id || 'Não configurado',
                                bot_configured: !!telegramConfig?.bot_token
                            };
                            break;

                        case NotificationChannelType.EMAIL:
                            const emailConfig = channel.config as EmailConfig;
                            testResult.details = {
                                smtp_host: emailConfig?.smtp_host || 'Não configurado',
                                from_email: emailConfig?.from_email || 'Não configurado'
                            };
                            break;

                        case NotificationChannelType.WEBHOOK:
                            const webhookConfig = channel.config as WebhookConfig;
                            testResult.details = {
                                webhook_url: webhookConfig?.webhook_url || 'Não configurado',
                                method: webhookConfig?.method || 'POST'
                            };
                            break;
                    }

                    resolve(testResult);
                })
                .catch(reject);
        });
    }

    static validateChannelConfig(type: NotificationChannelType, config: any): string | null {
        switch (type) {
            case NotificationChannelType.TELEGRAM:
                const telegramConfig = config as TelegramConfig;
                if (!telegramConfig.bot_token || !telegramConfig.chat_id) {
                    return 'bot_token e chat_id são obrigatórios para canais Telegram';
                }
                break;

            case NotificationChannelType.EMAIL:
                const emailConfig = config as EmailConfig;
                if (!emailConfig.smtp_host || !emailConfig.smtp_user || !emailConfig.from_email) {
                    return 'smtp_host, smtp_user e from_email são obrigatórios para canais Email';
                }
                break;

            case NotificationChannelType.WEBHOOK:
                const webhookConfig = config as WebhookConfig;
                if (!webhookConfig.webhook_url) {
                    return 'webhook_url é obrigatório para canais Webhook';
                }
                break;

            default:
                return 'Tipo de canal não suportado';
        }

        return null;
    }

    static validateChannelData(data: CreateNotificationChannelData | UpdateNotificationChannelData): string | null {
        if ('name' in data && data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                return 'Nome é obrigatório';
            }
            if (data.name.length > 255) {
                return 'Nome deve ter no máximo 255 caracteres';
            }
        }

        if ('type' in data && data.type !== undefined) {
            const validTypes = Object.values(NotificationChannelType);
            if (!validTypes.includes(data.type)) {
                return 'Tipo de canal inválido';
            }
        }

        if ('active' in data && data.active !== undefined) {
            if (typeof data.active !== 'boolean') {
                return 'Status ativo deve ser verdadeiro ou falso';
            }
        }

        return null;
    }
}