/**
 * Endpoints da API de autenticação
 */
export const AUTH_ENDPOINTS = {
    LOGIN: 'v1/auth/login',
} as const;

export const AUTH_STORAGE_KEYS = {
    TOKEN: 'chimera_auth_token',
    USER: 'chimera_auth_user',
    REMEMBER_ME: 'chimera_remember_me',
    EXPIRES_AT: 'chimera_auth_expires',
} as const;


// ===========================
// Configuration
// ===========================

/**
 * Configurações de autenticação
 */
export const AUTH_CONFIG = {
    DEFAULT_TOKEN_DURATION: 24 * 60 * 60 * 1000,
}


// ===========================
// Validation Rules
// ===========================

/**
 * Regras de validação para formulários de autenticação
 */
export const AUTH_VALIDATION = {
    EMAIL: {
        REQUIRED: 'Email é obrigatório',
        INVALID: 'Email deve ter um formato válido',
        MAX_LENGTH: 255,
    },
    PASSWORD: {
        REQUIRED: 'Senha é obrigatória',
        MIN_LENGTH: 6,
        MAX_LENGTH: 50,
        MIN_LENGTH_MESSAGE: 'Senha deve ter pelo menos 6 caracteres',
    },
    NAME: {
        REQUIRED: 'Nome é obrigatório',
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        MIN_LENGTH_MESSAGE: 'Nome deve ter pelo menos 2 caracteres',
    },
} as const;
