// ===========================
// Routine Validation Constants
// ===========================

/**
 * Constantes para validação de rotinas
 * Centralizadas para consistência nas mensagens de erro
 */
export const ROUTINE_VALIDATION = {
    // Nome da Rotina
    NAME: {
        REQUIRED: "Nome da rotina é obrigatório",
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        MIN_LENGTH_MESSAGE: "Nome deve ter pelo menos 2 caracteres",
        MAX_LENGTH_MESSAGE: "Nome deve ter no máximo 100 caracteres"
    },

    // Descrição
    DESCRIPTION: {
        REQUIRED: "Descrição é obrigatória",
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Descrição deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Descrição deve ter no máximo 500 caracteres"
    },

    // Contexto
    CONTEXT: {
        REQUIRED: "Contexto é obrigatório",
        MIN_LENGTH: 10,
        MAX_LENGTH: 1000,
        MIN_LENGTH_MESSAGE: "Contexto deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Contexto deve ter no máximo 1000 caracteres"
    },

    // Processing Stack
    PROCESSING_STACK: {
        REQUIRED: "Stack de processamento é obrigatória",
        MIN_ITEMS: 2,
        MIN_ITEMS_MESSAGE: "Deve ter pelo menos 2 etapas",
        MIN_LENGTH: 10,
        MAX_LENGTH: 5000,
        MIN_LENGTH_MESSAGE: "Stack deve ter pelo menos 10 caracteres",
        MAX_LENGTH_MESSAGE: "Stack deve ter no máximo 5000 caracteres"
    },

    // Telefones
    PHONES_TO_CALL: {
        MIN_ITEMS: 1,
        MIN_ITEMS_MESSAGE: "Deve ter pelo menos 1 telefone",
        PHONE_FORMAT: "Formato de telefone inválido"
    },

    // Status
    STATUS: {
        INVALID: "Status selecionado é inválido"
    },

    // Datas
    START_TIME: {
        INVALID: "Data de início inválida"
    },

    END_TIME: {
        INVALID: "Data de fim inválida",
        BEFORE_START: "Data de fim deve ser posterior à data de início"
    }
} as const

// ===========================
// Status Labels
// ===========================

/**
 * Labels para os status disponíveis de rotinas
 */
export const ROUTINE_STATUS_LABELS = {
    SCHEDULED: "Agendada",
    IN_PROGRESS: "Em Andamento",
    CONCLUDED: "Concluída",
    FAILED: "Falhou",
    CANCELED: "Cancelada"
} as const

/**
 * Configuração de cores para badges de status
 */
export const ROUTINE_STATUS_BADGE_CONFIG = {
    SCHEDULED: {
        label: "Agendada",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700"
    },
    IN_PROGRESS: {
        label: "Em Andamento",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700"
    },
    CONCLUDED: {
        label: "Concluída",
        className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700"
    },
    FAILED: {
        label: "Falhou",
        className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
    },
    CANCELED: {
        label: "Cancelada",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700"
    }
} as const

// ===========================
// Form Defaults
// ===========================

/**
 * Valores padrão para formulário de rotina
 */
export const ROUTINE_FORM_DEFAULTS = {
    active: true,
    status: "pending" as const,
    description: null,
    context: null,
    phones_to_call: [] as string[],
    processing_stack: "",
    start_time: null,
    end_time: null
} as const

// ===========================
// Placeholders text
// ===========================

/**
 * Campo de telefones em modo texto - separados por vírgula ou ponto e vírgula
 */
export const ROUTINE_FORM_PHONES_TO_CALL_TEXT = `Digite os telefones separados por vírgula ou ponto e vírgula:

(11) 99999-9999, (11) 88888-8888
(21) 77777-7777; (31) 66666-6666, (11) 55555-5555`
