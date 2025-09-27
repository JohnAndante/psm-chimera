export enum NotificationChannelType {
    TELEGRAM = 'TELEGRAM',
    EMAIL = 'EMAIL',
    WEBHOOK = 'WEBHOOK'
}

export interface NotificationChannelData {
    id: number;
    name: string;
    type: NotificationChannelType;
    config: unknown;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface CreateNotificationChannelData {
    name: string;
    type: NotificationChannelType;
    config: unknown;
    active?: boolean;
}

export interface UpdateNotificationChannelData {
    name?: string;
    type?: NotificationChannelType;
    config?: unknown;
    active?: boolean;
}

export interface NotificationChannelFilters {
    type?: NotificationChannelType;
    active?: boolean;
    search?: string;
}

// Configurações específicas por tipo de canal
export interface TelegramConfig {
    bot_token: string;
    chat_id: string;
}

export interface EmailConfig {
    smtp_host: string;
    smtp_port?: number;
    smtp_user: string;
    smtp_password: string;
    from_email: string;
    from_name?: string;
    use_tls?: boolean;
}

export interface WebhookConfig {
    webhook_url: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    timeout?: number;
}

// Interface para canais com jobs associados
export interface NotificationChannelWithJobs extends NotificationChannelData {
    job_notifications?: {
        job_config_id: number;
        job_config: {
            id: number;
            name: string;
            active: boolean;
            cron_pattern?: string;
        };
    }[];
}

// Interface para resultado de teste de notificação
export interface NotificationTestResult {
    success: boolean;
    message: string;
    channel_name: string;
    channel_type: NotificationChannelType;
    sent_at: string;
    details?: {
        chat_id?: string;
        bot_configured?: boolean;
        smtp_host?: string;
        from_email?: string;
        webhook_url?: string;
        method?: string;
    };
}
