// ===========================
// Agentes Page Types
// ===========================

import type { AgentDetails } from "@/types/agent"

/**
 * Dados do formulário de agente (cadastro/edição)
 * Baseado no CreateAgentDto do backend
 */
export interface AgentFormData {
    /** Nome do agente */
    name: string
    /** Descrição/persona do agente */
    description: string
    /** Objetivo do agente */
    objective: string
    /** Personalidade do agente */
    personality: string
    /** ID da voz do agente */
    voice_id: string
    /** Mensagem de apresentação (opcional) */
    presentation_message?: string | null
    /** Se o agente está ativo (opcional, padrão true) */
    active?: boolean
}

/**
 * Estado da página de agentes
 */
export interface AgentsPageState {
    /** Lista de agentes carregados */
    agentes: AgentDetails[]
    /** Estado de carregamento */
    isLoading: boolean
    /** Erro da API */
    error: string | null
    /** Agente selecionado para visualização */
    selectedAgent: AgentDetails | null
}



/**
 * Props para componentes de agente
 */
export interface AgentComponentProps {
    /** Agente para exibir/editar */
    agent: AgentDetails
    /** Callback quando agente é atualizado */
    onUpdate?: (agent: AgentDetails) => void
    /** Callback quando agente é excluído */
    onDelete?: (agentId: string) => void
}

/**
 * View modes da página
 */
export type AgentViewMode = 'list' | 'create' | 'view' | 'edit'

/**
 * Parâmetros de rota
 */
export interface AgentRouteParams {
    /** ID do agente (para view/edit) */
    id?: string
    /** Modo da página */
    mode: AgentViewMode
}

// ===========================
// Component Props Interfaces
// ===========================

/**
 * Props do componente AgentsList
 */
export interface AgentsListProps {
    /** Lista de agentes */
    agentes: AgentDetails[]
    /** Estado de carregamento */
    isLoading: boolean
    /** Callback para visualizar agente */
    onView: (agentId: string) => void
    /** Callback para editar agente */
    onEdit: (agent: AgentDetails) => void
    /** Callback para excluir agente */
    onDelete?: (agentId: string) => void
}

/**
 * Props do componente AgentForm
 */
export interface AgentFormProps {
    /** Agente para edição (undefined = cadastro) */
    agent?: AgentDetails
    /** Callback quando formulário é salvo com sucesso */
    onSave: () => void
    /** Callback para cancelar */
    onCancel: () => void
    /** Título customizado */
    title?: string
    /** Estado de carregamento */
    isLoading?: boolean
}

/**
 * Props do componente AgentView
 */
export interface AgentViewProps {
    /** Agente para visualizar */
    agent: AgentDetails | null
    /** Estado de carregamento */
    isLoading?: boolean
}
