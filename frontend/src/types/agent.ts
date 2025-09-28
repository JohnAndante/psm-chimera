/**
 * Resposta da criação de agente (baseada no retorno do backend)
 */
export interface CreateAgentResponse {
    /** ID do agente */
    id: string;
    /** Nome do agente */
    name: string;
    /** Descrição/persona do agente */
    description: string;
    /** Objetivo principal do agente */
    objective: string;
    /** Personalidade do agente */
    personality: string;
    /** ID da voz do agente */
    voice_id: string;
    /** Nome da voz do agente */
    voice_name: string;
    /** Gênero da voz do agente */
    voice_gender: 'male' | 'female';
    /** Mensagem de apresentação do agente (nullable) */
    presentation_message?: string | null;
    /** ID da empresa */
    company_id: string;
    /** Status ativo/inativo */
    active: boolean;
    /** Data de criação */
    created_at: string;
    /** Data de atualização */
    updated_at: string;
}

/**
 * Dados completos do agente (mesmo que CreateAgentResponse por enquanto)
 */
export interface AgentDetails extends CreateAgentResponse {
    deleted_at: string | null;
}
