import { SyncResult, CompareResult, SyncSummary } from '../types/notification.type';

/**
 * Serviço para templates padronizados de notificações do sistema de sync
 */
export class NotificationTemplateService {

    /**
     * Template para início de sincronização
     */
    static getSyncStartTemplate(storeCount: number, configName?: string): string {
        const stores = storeCount === 1 ? '1 loja' : `${storeCount} lojas`;
        const config = configName ? ` (${configName})` : '';

        return `🚀 *Sincronização Iniciada*${config}

📊 *Detalhes:*
• Lojas: ${stores}
• Status: Em execução
• Início: ${new Date().toLocaleString('pt-BR')}

⏳ Aguarde o processamento...`;
    }

    /**
     * Template para sincronização bem-sucedida
     */
    static getSyncSuccessTemplate(results: SyncResult[], summary: SyncSummary): string {
        const duration = Math.round(summary.execution_time_ms / 1000);
        const successCount = summary.successful_stores;
        const failedCount = summary.failed_stores;

        let message = `✅ *Sincronização Concluída com Sucesso*

📊 *Resumo:*
• Total de lojas: ${summary.total_stores}
• Lojas processadas: ${successCount}
• Produtos sincronizados: ${summary.total_products}
• Tempo de execução: ${duration}s`;

        if (failedCount > 0) {
            message += `\n• ⚠️ Lojas com erro: ${failedCount}`;
        }

        // Detalhes por loja (máximo 10 para não ficar muito longo)
        const storesDetails = results.slice(0, 10).map(result => {
            const status = result.status === 'success' ? '✅' : '❌';
            const products = result.products_synced > 0 ? ` (${result.products_synced} produtos)` : '';
            return `  ${status} ${result.store_name}${products}`;
        }).join('\n');

        if (storesDetails) {
            message += `\n\n🏪 *Detalhes por loja:*\n${storesDetails}`;
        }

        if (results.length > 10) {
            message += `\n... e mais ${results.length - 10} loja(s)`;
        }

        return message;
    }

    /**
     * Template para erro na sincronização
     */
    static getSyncErrorTemplate(error: string, configName?: string): string {
        const config = configName ? ` (${configName})` : '';

        return `❌ *Erro na Sincronização*${config}

🚨 *Detalhes do erro:*
${error}

⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}

🔧 Verifique as configurações e tente novamente.`;
    }

    /**
     * Template para resultados de comparação
     */
    static getCompareResultTemplate(comparison: CompareResult[]): string {
        const totalStores = comparison.length;
        const storesWithDifferences = comparison.filter(c =>
            c.differences.only_in_rp > 0 ||
            c.differences.only_in_crescevendas > 0 ||
            c.differences.price_differences > 0
        ).length;

        let message = `🔍 *Comparação RP ↔ CresceVendas*

📊 *Resumo:*
• Total de lojas: ${totalStores}
• Lojas com diferenças: ${storesWithDifferences}
• Lojas sincronizadas: ${totalStores - storesWithDifferences}`;

        if (storesWithDifferences > 0) {
            message += '\n\n⚠️ *Diferenças encontradas:*';

            // Mostrar apenas as primeiras 5 lojas com diferenças
            const storesToShow = comparison
                .filter(c =>
                    c.differences.only_in_rp > 0 ||
                    c.differences.only_in_crescevendas > 0 ||
                    c.differences.price_differences > 0
                )
                .slice(0, 5);

            storesToShow.forEach(store => {
                message += `\n\n🏪 *${store.store_name}:*`;
                message += `\n  • RP: ${store.rp_products} produtos`;
                message += `\n  • CresceVendas: ${store.crescevendas_products} produtos`;

                if (store.differences.only_in_rp > 0) {
                    message += `\n  • 📤 Apenas no RP: ${store.differences.only_in_rp}`;
                }
                if (store.differences.only_in_crescevendas > 0) {
                    message += `\n  • 📥 Apenas no CresceVendas: ${store.differences.only_in_crescevendas}`;
                }
                if (store.differences.price_differences > 0) {
                    message += `\n  • 💰 Diferenças de preço: ${store.differences.price_differences}`;
                }
            });

            if (storesWithDifferences > 5) {
                message += `\n\n... e mais ${storesWithDifferences - 5} loja(s) com diferenças`;
            }
        } else {
            message += '\n\n✅ Todos os produtos estão sincronizados!';
        }

        return message;
    }

    /**
     * Template para notificação de job agendado falhou
     */
    static getScheduledJobFailureTemplate(jobName: string, error: string): string {
        return `🚨 *Job Agendado Falhou*

📋 *Job:* ${jobName}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}

❌ *Erro:*
${error}

🔧 Verifique as configurações e logs do sistema.`;
    }

    /**
     * Template para notificação de job agendado executado com sucesso
     */
    static getScheduledJobSuccessTemplate(jobName: string, summary: SyncSummary): string {
        const duration = Math.round(summary.execution_time_ms / 1000);

        return `✅ *Job Agendado Executado*

📋 *Job:* ${jobName}
⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}

📊 *Resultado:*
• Lojas processadas: ${summary.successful_stores}/${summary.total_stores}
• Produtos sincronizados: ${summary.total_products}
• Tempo de execução: ${duration}s`;
    }

    /**
     * Template para status do sistema
     */
    static getSystemStatusTemplate(systemHealth: {
        database_connected: boolean;
        rp_integrations: number;
        crescevendas_integrations: number;
        active_configs: number;
        last_sync?: Date;
    }): string {
        const dbStatus = systemHealth.database_connected ? '✅ Conectado' : '❌ Desconectado';
        const lastSync = systemHealth.last_sync ?
            systemHealth.last_sync.toLocaleString('pt-BR') :
            'Nunca executado';

        return `🖥️ *Status do Sistema PSM Chimera*

🔧 *Componentes:*
• Banco de dados: ${dbStatus}
• Integrações RP: ${systemHealth.rp_integrations}
• Integrações CresceVendas: ${systemHealth.crescevendas_integrations}
• Configurações ativas: ${systemHealth.active_configs}

📅 *Última sincronização:* ${lastSync}

⏰ *Verificação:* ${new Date().toLocaleString('pt-BR')}`;
    }

    /**
     * Template personalizado com variáveis
     */
    static getCustomTemplate(template: string, variables: Record<string, any>): string {
        let message = template;

        // Substituir variáveis no formato {{variavel}}
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            message = message.replace(regex, String(value));
        });

        // Adicionar timestamp se não existir
        if (!message.includes('{{timestamp}}') && !message.includes(new Date().toLocaleString())) {
            message += `\n\n⏰ ${new Date().toLocaleString('pt-BR')}`;
        }

        return message;
    }

    /**
     * Escapa caracteres especiais do Markdown para Telegram
     */
    static escapeMarkdown(text: string): string {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }

    /**
     * Trunca mensagem se for muito longa (limite do Telegram: 4096 caracteres)
     */
    static truncateMessage(message: string, maxLength: number = 4000): string {
        if (message.length <= maxLength) {
            return message;
        }

        return message.substring(0, maxLength - 50) + '\n\n... (mensagem truncada)';
    }
}
