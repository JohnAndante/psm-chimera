import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import { agentsApi } from "@/controllers/agents-api"
import { useAuth } from "@/stores/auth"
import { useToast } from "@/hooks/use-toast"
import type { AgentDetails } from "@/types/agent"
import type { Voice } from "@/types/agent-api"
import { AGENT_FORM_DEFAULTS } from "@/constants/agent"

import { agentSchema } from "./validation"
import type { AgentFormData, AgentsPageState, AgentViewMode } from "./types"

// ===========================
// Agentes List Hook
// ===========================

/**
 * Hook para gerenciar a listagem de agentes
 */
export function useAgentsList() {
    const { toast } = useToast()
    const [state, setState] = useState<AgentsPageState>({
        agentes: [],
        isLoading: true,
        error: null,
        selectedAgent: null
    })

    const fetchAgentes = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        agentsApi.listAgents()
            .then(response => {

                // Verifica se há erro na resposta
                if (response.error) {
                    throw new Error(response.error.message as string || 'Erro da API')
                }

                // A API retorna diretamente um array de agentes
                const rawAgentes = response.data ?? [];

                // Converte CreateAgentResponse[] para AgentDetails[] adicionando deleted_at
                const agentesWithDeletedAt = Array.isArray(rawAgentes) ? rawAgentes.map(agent => ({
                    ...agent,
                    deleted_at: null
                })) : [];

                setState(prev => ({
                    ...prev,
                    agentes: agentesWithDeletedAt,
                    isLoading: false
                }));

            })
            .catch(error => {
                console.error('Erro ao buscar agentes:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar agentes'

                // Toast de erro para carregamento
                toast.error("Erro ao carregar agentes", {
                    description: errorMessage,
                })

                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    isLoading: false
                }))
            })
    }, [])

    const refreshAgents = useCallback(() => {
        fetchAgentes()
    }, [fetchAgentes])

    useEffect(() => {
        fetchAgentes()
    }, [])

    return {
        ...state,
        refreshAgents,
        setSelectedAgent: (agent: AgentDetails | null) =>
            setState(prev => ({ ...prev, selectedAgent: agent }))
    }
}

// ===========================
// Agent Form Hook
// ===========================

/**
 * Hook para formulário de agente (cadastro/edição)
 */
export function useAgentForm(agent?: AgentDetails) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [voices, setVoices] = useState<Voice[]>([])
    const { user } = useAuth()

    const form = useForm<AgentFormData>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            name: agent?.name || "",
            description: agent?.description || "",
            objective: agent?.objective || "",
            personality: agent?.personality || "",
            voice_id: agent?.voice_id || AGENT_FORM_DEFAULTS.voice_id,
            presentation_message: agent?.presentation_message || AGENT_FORM_DEFAULTS.presentation_message,
            active: agent?.active ?? AGENT_FORM_DEFAULTS.active
        }
    })

    // Carregar vozes quando o componente montar
    useEffect(() => {
        const loadVoices = async () => {
            try {
                const response = await agentsApi.listVoices()
                if (response.error) {
                    console.error('Erro ao carregar vozes:', response.error.message)
                    return
                }

                const voicesData = response.data || []
                console.log('Vozes carregadas:', voicesData)
                setVoices(voicesData)
            } catch (error) {
                console.error('Erro ao carregar vozes:', error)
            }
        }

        loadVoices()
    }, [])

    const onSubmit = useCallback((data: AgentFormData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        const processSubmit = () => {
            if (agent?.id) {
                // Atualização de agente existente
                return agentsApi.updateAgent(agent.id, {
                    name: data.name,
                    description: data.description,
                    objective: data.objective,
                    personality: data.personality,
                    voice_id: data.voice_id,
                    presentation_message: data.presentation_message,
                    active: data.active
                })
            } else {
                // Criação de novo agente
                if (!user?.company_id) {
                    return Promise.reject(new Error('ID da empresa não encontrado'))
                }

                return agentsApi.createAgent({
                    company_id: user.company_id,
                    name: data.name,
                    description: data.description,
                    objective: data.objective,
                    personality: data.personality,
                    voice_id: data.voice_id,
                    presentation_message: data.presentation_message,
                    active: data.active
                })
            }
        }

        return processSubmit()
            .then(response => {
                if (response.error) {
                    const errorMsg = Array.isArray(response.error.message)
                        ? response.error.message.join(', ')
                        : response.error.message;
                    throw new Error(errorMsg || 'Erro ao salvar agente')
                }

                // Mensagens de sucesso com toast
                if (agent?.id) {
                    // Edição
                    toast.success("Agente atualizado!", {
                        description: `${data.name} foi atualizado com sucesso.`,
                    })
                } else {
                    // Criação
                    toast.success("Agente criado!", {
                        description: `${data.name} foi criado com sucesso.`,
                    })
                }

                // Resetar form após sucesso na criação
                if (!agent?.id) {
                    form.reset()
                }

                setIsSubmitting(false)
                return { success: true }
            })
            .catch(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar agente'

                // Toast de erro
                toast.error("Erro ao salvar agente", {
                    description: errorMessage,
                })

                setSubmitError(errorMessage)
                setIsSubmitting(false)
                return { success: false, error: errorMessage }
            })
    }, [agent, form, user?.company_id, toast])

    return {
        form,
        isSubmitting,
        submitError,
        onSubmit,
        clearError: () => setSubmitError(null),
        voices
    }
}



// ===========================
// Navigation Hook
// ===========================

/**
 * Hook para navegação interna da página de agentes
 */
export function useAgentsNavigation() {
    const navigate = useNavigate()
    const params = useParams<{ id: string }>()
    const location = useLocation()

    // Determina o modo atual baseado na rota
    const getCurrentMode = useCallback((): AgentViewMode => {
        const path = location.pathname

        if (path.endsWith('/novo')) return 'create'
        if (params.id && path.endsWith('/editar')) return 'edit'
        if (params.id) return 'view'
        return 'list'
    }, [location.pathname, params.id])

    const mode = getCurrentMode()

    // Navegação
    const goToList = useCallback(() => {
        navigate('/agentes')
    }, [navigate])

    const goToCreate = useCallback(() => {
        navigate('/agentes/novo')
    }, [navigate])

    const goToView = useCallback((agentId: string) => {
        navigate(`/agentes/${agentId}`)
    }, [navigate])

    const goToEdit = useCallback((agentId: string) => {
        navigate(`/agentes/${agentId}/editar`)
    }, [navigate])

    return {
        mode,
        agentId: params.id,
        goToList,
        goToCreate,
        goToView,
        goToEdit
    }
}

// ===========================
// Agent Detail Hook
// ===========================

/**
 * Hook para buscar dados detalhados de um agente específico
 */
export function useAgentDetail(agentId?: string) {
    const [agent, setAgent] = useState<AgentDetails | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAgent = useCallback(async (id: string) => {
        if (!id) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await agentsApi.getAgent(id)

            if (response.error) {
                throw new Error(response.error.message as string || 'Erro ao buscar agente')
            }

            const agentData = response.data?.data
            if (agentData) {
                // Converte GetAgentResponse para AgentDetails adicionando deleted_at
                const agentDetails: AgentDetails = {
                    ...agentData,
                    deleted_at: null
                }
                setAgent(agentDetails)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agente'
            setError(errorMessage)
            console.error('Erro ao buscar agente:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (agentId) {
            fetchAgent(agentId)
        } else {
            setAgent(null)
            setError(null)
        }
    }, [agentId, fetchAgent])

    return {
        agent,
        isLoading,
        error,
        refetch: () => agentId ? fetchAgent(agentId) : Promise.resolve()
    }
}

// ===========================
// Main Agentes Hook
// ===========================

/**
 * Hook principal que integra toda a lógica da página de agentes
 */
export function useAgentes() {
    const navigation = useAgentsNavigation()
    const agentsList = useAgentsList()
    const agentDetail = useAgentDetail(navigation.agentId)

    // Usa apenas dados da requisição específica quando em modo view/edit
    // Para listagem, não precisa de currentAgent
    const currentAgent = (navigation.mode === 'view' || navigation.mode === 'edit')
        ? agentDetail.agent
        : null

    // Recarrega agentes sempre que acessar a listagem
    useEffect(() => {
        if (navigation.mode === 'list') {
            agentsList.refreshAgents()
        }
    }, [navigation.mode]) // Removido agentsList.refreshAgents da dependência

    // Recarrega dados do agente sempre que acessar view/edit
    useEffect(() => {
        if ((navigation.mode === 'view' || navigation.mode === 'edit') && navigation.agentId) {
            agentDetail.refetch()
        }
    }, [navigation.mode, navigation.agentId]) // Removido agentDetail.refetch da dependência

    return {
        // Navigation
        ...navigation,

        // Agents List
        agentes: agentsList.agentes,
        isLoading: navigation.mode === 'list' ? agentsList.isLoading : agentDetail.isLoading,
        error: navigation.mode === 'list' ? agentsList.error : agentDetail.error,
        refreshAgents: agentsList.refreshAgents,

        // Current Agent (apenas para view/edit)
        currentAgent,
        refetchAgent: agentDetail.refetch
    }
}
