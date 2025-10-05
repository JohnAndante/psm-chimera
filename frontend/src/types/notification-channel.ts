// Tipos de canal
export const NotificationChannelType = {
    TELEGRAM: 'TELEGRAM',
    EMAIL: 'EMAIL',
    WEBHOOK: 'WEBHOOK'
} as const;

export type NotificationChannelType = typeof NotificationChannelType[keyof typeof NotificationChannelType];

// Interface principal do canal
export interface NotificationChannelData {
    id: number;
    name: string;
    type: NotificationChannelType;
    config: TelegramConfig | EmailConfig | WebhookConfig;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// Configuração do Telegram
export interface TelegramConfig {
    bot_token: string;
    chat_id: string;
    allowed_users?: TelegramAllowedUser[];
    enable_interactive?: boolean;
    webhook_url?: string;
}

export interface TelegramAllowedUser {
    name: string;
    chat_id: number;
}

// Configuração do Email
export interface EmailConfig {
    smtp_host: string;
    smtp_port?: number;
    smtp_user: string;
    smtp_password: string;
    from_email: string;
    from_name?: string;
    use_tls?: boolean;
}

// Configuração do Webhook
export interface WebhookConfig {
    webhook_url: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    timeout?: number;
}

// Para criação
export interface CreateNotificationChannelData {
    name: string;
    type: NotificationChannelType;
    config: TelegramConfig | EmailConfig | WebhookConfig;
    active?: boolean;
}

// Para atualização
export interface UpdateNotificationChannelData {
    name?: string;
    type?: NotificationChannelType;
    config?: Partial<TelegramConfig | EmailConfig | WebhookConfig>;
    active?: boolean;
}

// Filtros para listagem
export interface NotificationChannelFilters {
    type?: NotificationChannelType;
    active?: boolean;
    search?: string;
}

// Resultado de teste
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

// Para teste de canal
export interface TestNotificationChannelData {
    message?: string;
    chat_id?: string;
}

// Resposta da API
export interface NotificationChannelResponse {
    message: string;
    channel?: NotificationChannelData;
    channels?: NotificationChannelData[];
}

export interface NotificationTestResponse {
    message: string;
    testResult: NotificationTestResult;
}

// Estado dos filtros na UI
export interface NotificationChannelFilterState {
    search: string;
    type: "ALL" | NotificationChannelType;
    active: "ALL" | "true" | "false";
}

// Filtros para API
export interface NotificationChannelApiFilters {
    search?: string;
    type?: NotificationChannelType;
    active?: boolean;
}
