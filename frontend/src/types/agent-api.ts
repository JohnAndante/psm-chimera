// ===========================
// Agent API Types
// ===========================

/**
 * Request para criação de agente
 * Baseado no CreateAgentDto do backend
 */
export interface CreateAgentRequest {
    /** ID da empresa */
    company_id: string
    /** Nome do agente */
    name: string
    /** Descrição/persona do agente */
    description: string
    /** Objetivo do agente */
    objective: string
    /** Personalidade do agente */
    personality: string
    /** ID da voz */
    voice_id: string
    /** Mensagem de apresentação (opcional) */
    presentation_message?: string | null
    /** Status ativo (opcional, padrão true) */
    active?: boolean
}

/**
 * Request para atualização de agente
 * Baseado no UpdateAgentDto do backend
 */
export interface UpdateAgentRequest {
    /** Nome do agente */
    name?: string
    /** Descrição/persona do agente */
    description?: string
    /** Objetivo do agente */
    objective?: string
    /** Personalidade do agente */
    personality?: string
    /** Mensagem de apresentação */
    presentation_message?: string | null
    /** ID da voz */
    voice_id?: string
    /** Status ativo */
    active?: boolean
}

/**
 * Resposta da criação de agente
 */
export interface CreateAgentResponse {
    /** ID do agente */
    id: string
    /** Nome do agente */
    name: string
    /** Descrição/persona do agente */
    description: string
    /** Objetivo do agente */
    objective: string
    /** Personalidade do agente */
    personality: string
    /** ID da voz */
    voice_id: string
    /** Nome da voz */
    voice_name: string
    /** Gênero da voz */
    voice_gender: 'male' | 'female'
    /** Mensagem de apresentação */
    presentation_message?: string | null
    /** ID da empresa */
    company_id: string
    /** Status ativo */
    active: boolean
    /** Data de criação */
    created_at: string
    /** Data de atualização */
    updated_at: string
}

/**
 * Resposta da atualização de agente
 */
export type UpdateAgentResponse = CreateAgentResponse

/**
 * Resposta da listagem de agentes
 * A API retorna diretamente um array, não um objeto wrapper
 */
export type ListAgentsResponse = CreateAgentResponse[]

/**
 * Resposta de detalhes de um agente
 */
export interface GetAgentResponse {
    message: string
    data: CreateAgentResponse
}

// ===========================
// Voice Types
// ===========================

/**
 * Estrutura de uma voz disponível para agentes
 */
export interface Voice {
    /** ID único da voz */
    id: string
    /** Nome da voz */
    name: string
    /** Gênero da voz (male/female) */
    gender: 'male' | 'female'
    /** Descrição da voz */
    description: string
}

/**
 * Resposta da API para listagem de vozes
 */
export type ListVoicesResponse = Voice[]
