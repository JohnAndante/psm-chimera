import TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig, TelegramAllowedUser } from '../types/notification.type';

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
                    chat_id: this.config!.chat_id,
                    allowed_users_count: this.config!.allowed_users?.length || 0,
                    interactive_enabled: this.config!.enable_interactive || false
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
     * Verifica se um chat_id tem permissão para interagir com o bot
     */
    isUserAllowed(chatId: number): boolean {
        if (!this.config) {
            return false;
        }

        const allowedUsers = this.config.allowed_users || [];

        // Se não tem nenhum usuário permitido, bloqueia todos
        if (allowedUsers.length === 0) {
            console.log(`[TELEGRAM] Usuário ${chatId} bloqueado: nenhum usuário permitido`);
            return false;
        }

        // Verifica se o chat_id está na lista de permitidos
        const isAllowed = allowedUsers.some(user => user.chat_id === chatId);

        if (!isAllowed) {
            console.log(`[TELEGRAM] Usuário ${chatId} não autorizado`);
        }

        return isAllowed;
    }

    /**
     * Obtém informações do usuário permitido pelo chat_id
     */
    getAllowedUser(chatId: number): TelegramAllowedUser | null {
        if (!this.config?.allowed_users) {
            return null;
        }

        return this.config.allowed_users.find(user => user.chat_id === chatId) || null;
    }

    /**
     * Lista todos os usuários permitidos
     */
    getAllowedUsers(): TelegramAllowedUser[] {
        return this.config?.allowed_users || [];
    }

    /**
     * Habilita modo interativo (polling) para receber mensagens
     */
    enableInteractiveMode(): void {
        if (!this.isConfigured()) {
            console.error('[TELEGRAM] Bot não configurado para modo interativo');
            return;
        }

        if (!this.config!.enable_interactive) {
            console.log('[TELEGRAM] Modo interativo desabilitado na configuração');
            return;
        }

        // Recriar bot com polling habilitado
        this.bot?.stopPolling();
        this.bot = new TelegramBot(this.config!.bot_token, { polling: true });

        // Configura handlers para mensagens
        this.setupMessageHandlers();

        console.log('[TELEGRAM] Modo interativo habilitado - bot aguardando mensagens');
    }

    /**
     * Configura handlers para mensagens recebidas
     */
    private setupMessageHandlers(): void {
        if (!this.bot) return;

        // Handler para todas as mensagens
        this.bot.on('message', (msg) => {
            this.handleIncomingMessage(msg);
        });

        // Handler para comandos
        this.bot.onText(/\/(.+)/, (msg, match) => {
            if (match) {
                this.handleCommand(msg, match[1]);
            }
        });
    }

    /**
     * Processa mensagens recebidas
     */
    private handleIncomingMessage(msg: any): void {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        const username = msg.from?.username || msg.from?.first_name || 'Desconhecido';

        console.log(`[TELEGRAM] Mensagem recebida de ${username} (${chatId}): ${msg.text}`);

        // Verifica permissões
        if (!this.isUserAllowed(chatId)) {
            // Envia mensagem de acesso negado
            this.bot?.sendMessage(chatId,
                '🚫 *Acesso Negado*\n\n' +
                'Você não tem permissão para interagir com este bot.\n' +
                'Entre em contato com o administrador do sistema.',
                { parse_mode: 'Markdown' }
            );
            return;
        }

        const allowedUser = this.getAllowedUser(chatId);
        console.log(`[TELEGRAM] Mensagem autorizada de ${allowedUser?.name || username}`);

        // Aqui pode processar comandos específicos
        if (msg.text === '/status') {
            this.sendSystemStatus(chatId);
        } else if (msg.text === '/help') {
            this.sendHelp(chatId);
        }
    }

    /**
     * Processa comandos específicos
     */
    private handleCommand(msg: any, command: string): void {
        const chatId = msg.chat.id;

        if (!this.isUserAllowed(chatId)) {
            return; // Já tratado no handleIncomingMessage
        }

        console.log(`[TELEGRAM] Comando recebido: /${command}`);

        switch (command) {
            case 'start':
                this.sendWelcome(chatId);
                break;
            case 'status':
                this.sendSystemStatus(chatId);
                break;
            case 'help':
                this.sendHelp(chatId);
                break;
            default:
                this.bot?.sendMessage(chatId, `Comando /${command} não reconhecido. Use /help para ver comandos disponíveis.`);
        }
    }

    /**
     * Envia mensagem de boas-vindas
     */
    private sendWelcome(chatId: number): void {
        const allowedUser = this.getAllowedUser(chatId);
        const userName = allowedUser?.name || 'Usuário';

        this.bot?.sendMessage(chatId,
            `👋 *Olá, ${userName}!*\n\n` +
            '🤖 Bem-vindo ao PSM Chimera Bot\n' +
            '📊 Este bot envia notificações sobre jobs e sincronizações\n\n' +
            'Use /help para ver comandos disponíveis.',
            { parse_mode: 'Markdown' }
        );
    }

    /**
     * Envia status do sistema
     */
    private sendSystemStatus(chatId: number): void {
        this.bot?.sendMessage(chatId,
            '📊 *Status do Sistema*\n\n' +
            '✅ Bot Online\n' +
            `👥 Usuários Permitidos: ${this.config?.allowed_users?.length || 0}\n` +
            `💬 Chat Principal: ${this.config?.chat_id}\n` +
            `⏰ Última Verificação: ${new Date().toLocaleString('pt-BR')}`,
            { parse_mode: 'Markdown' }
        );
    }

    /**
     * Envia lista de comandos
     */
    private sendHelp(chatId: number): void {
        this.bot?.sendMessage(chatId,
            '🆘 *Comandos Disponíveis*\n\n' +
            '/start - Mensagem de boas-vindas\n' +
            '/status - Status do sistema\n' +
            '/help - Esta mensagem\n\n' +
            '📝 Este bot também envia notificações automáticas sobre:\n' +
            '• Execução de jobs\n' +
            '• Sincronização de produtos\n' +
            '• Status de operações',
            { parse_mode: 'Markdown' }
        );
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
    async sendFormattedMessage(message: TelegramMessage, customChatId?: string): Promise<TelegramSendResult> {
        if (!this.isConfigured()) {
            return {
                success: false,
                error: 'Bot não configurado'
            };
        }

        // Use chat_id customizado se fornecido, senão use o configurado
        const targetChatId = customChatId || this.config!.chat_id;

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
                targetChatId,
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
    async sendTestNotification(message: string = 'Teste de notificação do PSM Chimera v2', customChatId?: string): Promise<TelegramSendResult> {
        const targetChatId = customChatId || this.config?.chat_id;

        if (!targetChatId) {
            return {
                success: false,
                error: 'Nenhum chat_id configurado ou fornecido'
            };
        }

        const testMessage = {
            text: `🧪 *Teste de Notificação*\n\n` +
                `📝 *Mensagem:* ${message}\n` +
                `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n` +
                `🤖 *Bot:* PSM Chimera v2` +
                (customChatId ? `\n🎯 *Chat ID:* ${customChatId}` : ''),
            parse_mode: 'Markdown' as const,
            disable_notification: true
        };

        return this.sendFormattedMessage(testMessage, targetChatId);
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
