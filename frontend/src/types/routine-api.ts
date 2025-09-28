// ===========================
// Routine API Types
// ===========================

/**
 * Request para criação de rotina
 * Baseado no CreateRoutineDto do backend
 */
export interface CreateRoutineRequest {
    /** ID da empresa */
    company_id: string
    /** ID do agente responsável */
    agent_id: string
    /** Nome da rotina */
    name: string
    /** Descrição da rotina (opcional) */
    description?: string | null
    /** Contexto adicional (opcional) */
    context?: string | null
    /** Array de telefones para ligar (opcional) */
    phones_to_call?: string[] | null
    /** Stack de processamento (JSON string, obrigatório) */
    processing_stack: string
    /** Status ativo (opcional, padrão true) */
    active?: boolean
    /** Status da rotina (opcional) */
    status?: string | null
    /** Horário de início (ISO date, opcional) */
    start_time?: string | null
    /** Horário de fim (ISO date, opcional) */
    end_time?: string | null
}

/**
 * Request para atualização de rotina
 * Todos os campos opcionais
 */
export interface UpdateRoutineRequest {
    /** ID do agente responsável */
    agent_id?: string
    /** Nome da rotina */
    name?: string
    /** Descrição da rotina */
    description?: string | null
    /** Contexto adicional */
    context?: string | null
    /** Array de telefones para ligar */
    phones_to_call?: string[] | null
    /** Stack de processamento (JSON string) */
    processing_stack?: string
    /** Status ativo */
    active?: boolean
    /** Status da rotina */
    status?: string | null
    /** Horário de início (ISO date) */
    start_time?: string | null
    /** Horário de fim (ISO date) */
    end_time?: string | null
}

/**
 * Resposta da criação de rotina
 */
export interface CreateRoutineResponse {
    /** ID da rotina */
    id: string
    /** ID da empresa */
    company_id: string
    /** ID do agente responsável */
    agent_id: string
    /** Nome do agente responsável */
    agent_name?: string
    /** Nome da rotina */
    name: string
    /** Descrição da rotina */
    description?: string | null
    /** Contexto adicional */
    context?: string | null
    /** Array de telefones para ligar */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phones_to_call?: any[] | null
    /** Stack de processamento */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processing_stack?: any | null
    /** Status ativo */
    active: boolean
    /** Status da rotina */
    status?: string | null
    /** Horário de início */
    start_time?: string | null
    /** Horário de fim */
    end_time?: string | null
    /** Contador de sucessos */
    success_count: number
    /** Contador de falhas */
    fail_count: number
    /** Data de criação */
    created_at: string
    /** Data de atualização */
    updated_at: string
    /** Data de exclusão */
    deleted_at?: string | null
}

/**
 * Resposta da atualização de rotina
 */
export type UpdateRoutineResponse = CreateRoutineResponse

/**
 * Resposta da listagem de rotinas
 * A API retorna diretamente um array via company endpoint
 */
export type ListRoutinesResponse = CreateRoutineResponse[]

/**
 * Resposta de detalhes de uma rotina
 */
export interface GetRoutineResponse {
    message: string
    data: CreateRoutineResponse
}
