import dotenv from 'dotenv';
import { EnvironmentConfig, RequiredEnvVars, DefaultEnvValues } from '../types/environment.type';

// Carrega as variáveis de ambiente
dotenv.config();

/**
 * Factory para variáveis de ambiente tipadas e validadas
 */
class EnvironmentFactory {
    private static instance: EnvironmentConfig | null = null;

    /**
     * Valores padrão para variáveis opcionais
     */
    private static readonly defaults: DefaultEnvValues = {
        PORT: '3000',
        NODE_ENV: 'development',
        JWT_EXPIRES_IN: '7d',
        LOG_LEVEL: 'info'
    };

    /**
     * Lista de variáveis obrigatórias
     */
    private static readonly requiredVars: RequiredEnvVars[] = [
        'DATABASE_URL'
    ];

    private constructor() { }

    /**
     * Obtém a instância singleton da configuração de ambiente
     */
    public static getInstance(): EnvironmentConfig {
        if (!EnvironmentFactory.instance) {
            EnvironmentFactory.instance = EnvironmentFactory.loadEnvironment();
        }
        return EnvironmentFactory.instance;
    }

    /**
     * Carrega e valida as variáveis de ambiente
     */
    private static loadEnvironment(): EnvironmentConfig {
        // Validar variáveis obrigatórias
        EnvironmentFactory.validateRequiredVars();

        // Log de diagnóstico
        console.log('[ENV] Carregando configuração de ambiente...');
        console.log('[ENV] NODE_ENV:', process.env.NODE_ENV || EnvironmentFactory.defaults.NODE_ENV);

        const config: EnvironmentConfig = {
            // Database (obrigatória)
            DATABASE_URL: process.env.DATABASE_URL!,

            // Server
            PORT: process.env.PORT || EnvironmentFactory.defaults.PORT,
            NODE_ENV: (process.env.NODE_ENV as any) || EnvironmentFactory.defaults.NODE_ENV,
            FRONTEND_URL: process.env.FRONTEND_URL,

            // JWT/Auth
            JWT_SECRET: process.env.JWT_SECRET,
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || EnvironmentFactory.defaults.JWT_EXPIRES_IN,

            // Logging
            LOG_LEVEL: (process.env.LOG_LEVEL as any) || EnvironmentFactory.defaults.LOG_LEVEL
        };

        console.log('[ENV] ✅ Configuração carregada com sucesso');

        // Log de variáveis sensíveis mascaradas
        if (config.DATABASE_URL) {
            const maskedUrl = config.DATABASE_URL.replace(/:([^:@]+)@/, ':*****@');
            console.log('[ENV] DATABASE_URL:', maskedUrl);
        }

        if (config.JWT_SECRET) {
            console.log('[ENV] JWT_SECRET: *****');
        }

        return config;
    }

    /**
     * Valida se todas as variáveis obrigatórias estão presentes
     */
    private static validateRequiredVars(): void {
        const missingVars: string[] = [];

        for (const varName of EnvironmentFactory.requiredVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }

        if (missingVars.length > 0) {
            const errorMessage = `[ENV] ❌ Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Obtém uma variável específica (para uso direto)
     */
    public static get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
        return EnvironmentFactory.getInstance()[key];
    }

    /**
     * Verifica se está em ambiente de desenvolvimento
     */
    public static isDevelopment(): boolean {
        return EnvironmentFactory.get('NODE_ENV') === 'development';
    }

    /**
     * Verifica se está em ambiente de produção
     */
    public static isProduction(): boolean {
        return EnvironmentFactory.get('NODE_ENV') === 'production';
    }

    /**
     * Verifica se está em ambiente de teste
     */
    public static isTest(): boolean {
        return EnvironmentFactory.get('NODE_ENV') === 'test';
    }

    /**
     * Obtém a porta do servidor como número
     */
    public static getPort(): number {
        return parseInt(EnvironmentFactory.get('PORT') || '3000', 10);
    }
}

// Export da instância e métodos utilitários
export const env = EnvironmentFactory.getInstance();
export const EnvFactory = EnvironmentFactory;
export default EnvironmentFactory;
