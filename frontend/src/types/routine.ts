/**
 * Status de uma rotina
 */
export type RoutineStatus = 'active' | 'inactive' | 'pending' | 'completed' | 'failed'

/**
 * Resposta da criação de rotina (baseada no retorno do backend)
 */
export interface CreateRoutineResponse {
    /** ID da rotina */
    id: string;
    /** ID da empresa */
    company_id: string;
    /** ID do agente responsável */
    agent_id: string;
    /** Nome do agente responsável */
    agent_name?: string;
    /** Nome da rotina */
    name: string;
    /** Descrição da rotina */
    description?: string | null;
    /** Contexto adicional */
    context?: string | null;
    /** Array de telefones para ligar */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phones_to_call?: any[] | null;
    /** Stack de processamento */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processing_stack?: any | null;
    /** Status ativo/inativo */
    active: boolean;
    /** Status da rotina */
    status?: string | null;
    /** Horário de início */
    start_time?: string | null;
    /** Horário de fim */
    end_time?: string | null;
    /** Contador de sucessos */
    success_count: number;
    /** Contador de falhas */
    fail_count: number;
    /** Data de criação */
    created_at: string;
    /** Data de atualização */
    updated_at: string;
}

/**
 * Dados completos da rotina (incluindo deleted_at)
 */
export interface RoutineDetails extends CreateRoutineResponse {
    deleted_at: string | null;
}
