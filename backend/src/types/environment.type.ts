/**
 * Tipos para as variáveis de ambiente da aplicação
 */
export interface EnvironmentConfig {
    // Database
    DATABASE_URL: string;

    // Server
    SERVER_PORT?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    FRONTEND_URL?: string;

    // JWT/Auth
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;

    // Logging
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Configurações obrigatórias que devem estar presentes
 */
export type RequiredEnvVars = 'DATABASE_URL';

/**
 * Configurações com valores padrão
 */
export interface DefaultEnvValues {
    SERVER_PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    JWT_EXPIRES_IN: string;
    LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}
