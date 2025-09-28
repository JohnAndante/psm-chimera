/**
 * Constantes e configurações relacionadas aos agentes
 */

// ===========================
// Validation Constants
// ===========================

export const AGENT_VALIDATION = {
    // Nome
    NAME: {
        REQUIRED: "Nome é obrigatório",
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        MIN_LENGTH_MESSAGE: "Nome deve ter pelo menos 2 caracteres",
        MAX_LENGTH_MESSAGE: "Nome deve ter no máximo 100 caracteres"
    },

    // Descrição/Persona
    DESCRIPTION: {
        REQUIRED: "Descrição é obrigatória",
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Descrição deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Descrição deve ter no máximo 1000 caracteres"
    },

    // Objetivo
    OBJECTIVE: {
        REQUIRED: "Objetivo é obrigatório",
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Objetivo deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Objetivo deve ter no máximo 1000 caracteres"
    },

    // Personalidade
    PERSONALITY: {
        REQUIRED: "Personalidade é obrigatória",
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Personalidade deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Personalidade deve ter no máximo 1000 caracteres"
    },

    // Tipo de Voz
    VOICE_ID: {
        REQUIRED: "Voz é obrigatória",
        INVALID: "Voz selecionada é inválida"
    },

    // Mensagem de Apresentação (opcional)
    PRESENTATION_MESSAGE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Mensagem deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Mensagem deve ter no máximo 1000 caracteres"
    }
} as const

// ===========================
// Voice Labels (Future Implementation)
// ===========================

/**
 * Placeholder para future voice labels
 * Será implementado quando a rota de voices estiver disponível
 */

// ===========================
// Form Defaults
// ===========================

export const AGENT_FORM_DEFAULTS = {
    active: true,
    voice_id: "", // Será preenchido quando houver voices disponíveis
    presentation_message: null
} as const
