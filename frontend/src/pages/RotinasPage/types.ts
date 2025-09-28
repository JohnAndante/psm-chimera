// ===========================
// Rotinas Page Types
// ===========================

import type { RoutineDetails } from "@/types/routine"

/**
 * Dados do formulário de rotina (cadastro/edição)
 * Baseado no CreateRoutineDto do backend
 */
export interface RoutineFormData {
    /** ID do agente responsável */
    agent_id: string
    /** Nome da rotina */
    name: string
    /** Descrição da rotina (opcional) */
    description?: string | null
    /** Contexto adicional (opcional) */
    context?: string | null
    /** Array de telefones para ligar (opcional) */
    phones_to_call: string[]
    /** Stack de processamento (obrigatório) */
    processing_stack: string
    /** Status ativo (opcional, padrão true) */
    active?: boolean
    /** Status da rotina (opcional) */
    status?: string | null
    /** Horário de início (opcional) */
    start_time?: string | null
    /** Horário de fim (opcional) */
    end_time?: string | null
}

/**
 * Estado da página de rotinas
 */
export interface RotinasPageState {
    /** Lista de rotinas carregadas */
    rotinas: RoutineDetails[]
    /** Estado de carregamento */
    isLoading: boolean
    /** Mensagem de erro (se houver) */
    error: string | null
    /** Rotina selecionada para visualização/edição */
    selectedRoutine: RoutineDetails | null
}

/**
 * Modos de visualização da página
 */
export type RoutineViewMode = 'list' | 'create' | 'view' | 'edit'

/**
 * Props do componente de listagem
 */
export interface RoutineListProps {
    /** Lista de rotinas */
    rotinas: RoutineDetails[]
    /** Estado de carregamento */
    isLoading: boolean
    /** Callback para visualizar rotina */
    onView: (routineId: string) => void
    /** Callback para editar rotina */
    onEdit: (routine: RoutineDetails) => void
    /** Callback para excluir rotina (futuro) */
    onDelete?: (routineId: string) => void
}

/**
 * Props do componente de formulário
 */
export interface RoutineFormProps {
    /** Rotina para edição (undefined para criação) */
    routine?: RoutineDetails
    /** Callback de sucesso após salvar */
    onSuccess?: () => void
    /** Callback de cancelamento */
    onCancel?: () => void
}

/**
 * Props do componente de visualização
 */
export interface RoutineViewProps {
    /** Rotina para visualização */
    routine: RoutineDetails | null
    /** Estado de carregamento */
    isLoading?: boolean
}

/**
 * Props para hook de navegação
 */
export interface RoutinesNavigationProps {
    /** ID da rotina atual (se houver) */
    routineId?: string
}

/**
 * Props para hook principal
 */
export interface UseRotinasProps {
    /** Configurações adicionais */
    config?: {
        /** Auto-refresh interval em ms */
        refreshInterval?: number
    }
}
