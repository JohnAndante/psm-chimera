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
export interface TelegramAllowedUser {
    name: string;
    chat_id: number;
}

export interface TelegramConfig {
    bot_token: string;
    chat_id: string;
    allowed_users?: TelegramAllowedUser[];  // Se vazio, não aceita mensagens de ninguém
    enable_interactive?: boolean;  // Se deve aceitar comandos interativos
    webhook_url?: string;  // URL para webhook (opcional)
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
        original_chat_id?: string;
        custom_chat_used?: boolean;
        bot_configured?: boolean;
        smtp_host?: string;
        from_email?: string;
        webhook_url?: string;
        method?: string;
        message_id?: number;
        error?: string;
    };
}

// Telegram specific interfaces
export interface TelegramMessage {
    text: string;
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
}

export interface TelegramSendResult {
    success: boolean;
    message_id?: number;
    error?: string;
    details?: any;
}

// Notification template interfaces
export interface SyncResult {
    store_id: number;
    store_name: string;
    products_synced: number;
    status: 'success' | 'failed';
    error?: string;
}

export interface CompareResult {
    store_id: number;
    store_name: string;
    rp_products: number;
    crescevendas_products: number;
    differences: {
        only_in_rp: number;
        only_in_crescevendas: number;
        price_differences: number;
    };
}

export interface SyncSummary {
    total_stores: number;
    successful_stores: number;
    failed_stores: number;
    total_products: number;
    execution_time_ms: number;
}
