import TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig } from '../types/notification.type';

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

export class TelegramService {
    private bot: TelegramBot | null = null;
    private config: TelegramConfig | null = null;

    constructor(config?: TelegramConfig) {
        if (config) {
            this.initialize(config);
        }
    }

    /**
     * Inicializa o bot com as configurações fornecidas
     */
    initialize(config: TelegramConfig): void {
        try {
            this.config = config;
            this.bot = new TelegramBot(config.bot_token, { polling: false });
            console.log(`[TELEGRAM] Bot inicializado para chat: ${config.chat_id}`);
        } catch (error) {
            console.error('[TELEGRAM] Erro ao inicializar bot:', error);
            throw new Error('Falha ao inicializar bot do Telegram');
        }
    }

    /**
     * Verifica se o bot está configurado
     */
    isConfigured(): boolean {
        return this.bot !== null && this.config !== null;
    }

    /**
     * Testa a conexão com o bot
     */
    async testConnection(): Promise<TelegramSendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Bot não configurado'
            };
        }

        try {
            const me = await this.bot!.getMe();
            return {
                success: true,
                details: {
                    bot_username: me.username,
                    bot_name: me.first_name,
                    chat_id: this.config!.chat_id
                }
            };
        } catch (error: any) {
            console.error('[TELEGRAM] Erro ao testar conexão:', error);
            return {
                success: false,
                error: error.message || 'Erro ao conectar com Telegram API',
                details: error
            };
        }
    }

    /**
     * Envia mensagem simples
     */
    async sendMessage(text: string): Promise<TelegramSendResult> {
        return this.sendFormattedMessage({ text });
    }

    /**
     * Envia mensagem formatada
     */
    async sendFormattedMessage(message: TelegramMessage): Promise<TelegramSendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Bot não configurado'
            };
        }

        try {
            const options: any = {};

            if (message.parse_mode) {
                options.parse_mode = message.parse_mode;
            }

            if (message.disable_web_page_preview !== undefined) {
                options.disable_web_page_preview = message.disable_web_page_preview;
            }

            if (message.disable_notification !== undefined) {
                options.disable_notification = message.disable_notification;
            }

            const result = await this.bot!.sendMessage(
                this.config!.chat_id,
                message.text,
                options
            );

            console.log(`[TELEGRAM] Mensagem enviada com sucesso: ${result.message_id}`);

            return {
                success: true,
                message_id: result.message_id
            };

        } catch (error: any) {
            console.error('[TELEGRAM] Erro ao enviar mensagem:', error);
            return {
                success: false,
                error: error.message || 'Erro ao enviar mensagem',
                details: error
            };
        }
    }

    /**
     * Envia notificação de job iniciado
     */
    async sendJobStartedNotification(jobName: string, storeName?: string): Promise<TelegramSendResult> {
        const storeInfo = storeName ? ` para a loja *${storeName}*` : '';
        const message = {
            text: `🚀 *Job Iniciado*\n\n` +
                `📋 *Job:* ${jobName}\n` +
                `🏪 *Loja:*${storeInfo}\n` +
                `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n` +
                `📊 *Status:* Em execução...`,
            parse_mode: 'Markdown' as const,
            disable_notification: false
        };

        return this.sendFormattedMessage(message);
    }

    /**
     * Envia notificação de job concluído
     */
    async sendJobCompletedNotification(
        jobName: string,
        success: boolean,
        duration?: number,
        details?: string,
        storeName?: string
    ): Promise<TelegramSendResult> {
        const emoji = success ? '✅' : '❌';
        const status = success ? 'Concluído com Sucesso' : 'Falhou';
        const storeInfo = storeName ? ` para a loja *${storeName}*` : '';
        const durationInfo = duration ? `\n⏱️ *Duração:* ${Math.round(duration / 1000)}s` : '';
        const detailsInfo = details ? `\n📝 *Detalhes:* ${details}` : '';

        const message = {
            text: `${emoji} *Job ${status}*\n\n` +
                `📋 *Job:* ${jobName}\n` +
                `🏪 *Loja:*${storeInfo}\n` +
                `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}${durationInfo}${detailsInfo}`,
            parse_mode: 'Markdown' as const,
            disable_notification: false
        };

        return this.sendFormattedMessage(message);
    }

    /**
     * Envia notificação de sincronização de produtos
     */
    async sendSyncNotification(
        storeName: string,
        registration: string,
        status: 'started' | 'completed' | 'failed',
        productsCount?: number,
        error?: string
    ): Promise<TelegramSendResult> {
        let message: TelegramMessage;

        switch (status) {
            case 'started':
                message = {
                    text: `🔄 *Sincronização Iniciada*\n\n` +
                        `🏪 *Loja:* ${storeName}\n` +
                        `🔑 *Código:* ${registration}\n` +
                        `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n` +
                        `📊 *Status:* Sincronizando produtos...`,
                    parse_mode: 'Markdown' as const
                };
                break;

            case 'completed':
                const productInfo = productsCount !== undefined ? `\n📦 *Produtos:* ${productsCount}` : '';
                message = {
                    text: `✅ *Sincronização Concluída*\n\n` +
                        `🏪 *Loja:* ${storeName}\n` +
                        `🔑 *Código:* ${registration}\n` +
                        `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}${productInfo}`,
                    parse_mode: 'Markdown' as const
                };
                break;

            case 'failed':
                const errorInfo = error ? `\n❌ *Erro:* ${error}` : '';
                message = {
                    text: `🚨 *Sincronização Falhou*\n\n` +
                        `🏪 *Loja:* ${storeName}\n` +
                        `🔑 *Código:* ${registration}\n` +
                        `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}${errorInfo}`,
                    parse_mode: 'Markdown' as const
                };
                break;
        }

        return this.sendFormattedMessage(message);
    }

    /**
     * Envia notificação de teste
     */
    async sendTestNotification(message: string = 'Teste de notificação do PSM Chimera v2'): Promise<TelegramSendResult> {
        const testMessage = {
            text: `🧪 *Teste de Notificação*\n\n` +
                `📝 *Mensagem:* ${message}\n` +
                `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n` +
                `🤖 *Bot:* PSM Chimera v2`,
            parse_mode: 'Markdown' as const,
            disable_notification: true
        };

        return this.sendFormattedMessage(testMessage);
    }

    /**
     * Formata erro para envio
     */
    private formatError(error: any): string {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        return 'Erro desconhecido';
    }

    /**
     * Destrutor - limpa recursos
     */
    destroy(): void {
        if (this.bot) {
            try {
                // Se polling estiver ativo, parar
                if (this.bot.isPolling()) {
                    this.bot.stopPolling();
                }
            } catch (error) {
                console.warn('[TELEGRAM] Aviso ao destruir bot:', error);
            }
            this.bot = null;
        }
        this.config = null;
        console.log('[TELEGRAM] Bot destruído');
    }
}

// Instância singleton para reutilização
let telegramInstance: TelegramService | null = null;

/**
 * Factory function para obter instância do TelegramService
 */
export function getTelegramService(config?: TelegramConfig): TelegramService {
    if (!telegramInstance) {
        telegramInstance = new TelegramService(config);
    } else if (config && (!telegramInstance.isConfigured() ||
        JSON.stringify(telegramInstance['config']) !== JSON.stringify(config))) {
        // Se config mudou, reinicializar
        telegramInstance.destroy();
        telegramInstance = new TelegramService(config);
    }

    return telegramInstance;
}

/**
 * Limpa instância singleton
 */
export function destroyTelegramService(): void {
    if (telegramInstance) {
        telegramInstance.destroy();
        telegramInstance = null;
    }
}
