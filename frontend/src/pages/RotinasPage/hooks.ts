/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { toast } from "sonner"

import { routinesApi } from "@/controllers/routines-api"
import { agentsApi } from "@/controllers/agents-api"
import { useAuth } from "@/stores/auth"
import type { RoutineDetails } from "@/types/routine"
import type { AgentDetails } from "@/types/agent"
import { ROUTINE_FORM_DEFAULTS } from "@/constants/routine"

import { routineSchema } from "./validation"
import type { RoutineFormData, RotinasPageState, RoutineViewMode } from "./types"

// ===========================
// Agents Hook for Routines
// ===========================

/**
 * Hook para buscar agentes para seleção em rotinas
 */
export function useRoutineAgents() {
    const [agents, setAgents] = useState<AgentDetails[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchAgents = useCallback(() => {
        if (!user?.company_id) {
            setError("ID da empresa não encontrado")
            setIsLoading(false)
            return Promise.resolve()
        }

        setIsLoading(true)
        setError(null)

        return agentsApi.listAgents()
            .then(response => {
                if (response.error) {
                    throw new Error(response.error.message as string || 'Erro ao buscar agentes')
                }

                const rawAgents = response.data ?? []
                const agentsData = rawAgents.map((agent: any) => ({
                    ...agent,
                    deleted_at: null
                })) as AgentDetails[]

                setAgents(agentsData)
                setError(null)
            })
            .catch(err => {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
                setError(errorMessage)
                console.error('Erro ao buscar agentes:', err)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [user?.company_id])

    useEffect(() => {
        fetchAgents()
    }, [])

    return {
        agents,
        isLoading,
        error,
        refetch: fetchAgents
    }
}

// ===========================
// Rotinas List Hook
// ===========================

/**
 * Hook para gerenciar a listagem de rotinas
 */
export function useRotinasList() {
    const [state, setState] = useState<RotinasPageState>({
        rotinas: [],
        isLoading: true,
        error: null,
        selectedRoutine: null
    })
    const { user } = useAuth()

    const fetchRotinas = useCallback(() => {
        if (!user?.company_id) {
            setState(prev => ({
                ...prev,
                error: "ID da empresa não encontrado",
                isLoading: false
            }))
            return Promise.resolve()
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }))

        return routinesApi.listRoutines(user.company_id)
            .then(response => {
                // Verifica se há erro na resposta
                if (response.error) {
                    throw new Error(response.error.message as string || 'Erro da API')
                }

                // A API retorna diretamente um array de rotinas
                const rawRotinas = response.data ?? [];

                // Converte CreateRoutineResponse[] para RoutineDetails[] adicionando deleted_at
                const rotinasWithDeletedAt = Array.isArray(rawRotinas) ? rawRotinas.map(routine => ({
                    ...routine,
                    deleted_at: null
                })) : [];

                setState(prev => ({
                    ...prev,
                    rotinas: rotinasWithDeletedAt,
                    isLoading: false
                }));
            })
            .catch(error => {
                console.error('Erro ao buscar rotinas:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar rotinas'

                // Toast de erro para carregamento
                toast.error("Erro ao carregar rotinas", {
                    description: errorMessage,
                })

                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    isLoading: false
                }))
            })
    }, [user?.company_id])

    const refreshRotinas = useCallback(() => {
        return fetchRotinas()
    }, [fetchRotinas])

    useEffect(() => {
        fetchRotinas()
    }, [fetchRotinas])

    return {
        ...state,
        refreshRotinas,
        setSelectedRoutine: (routine: RoutineDetails | null) =>
            setState(prev => ({ ...prev, selectedRoutine: routine }))
    }
}

// ===========================
// Routine Form Hook
// ===========================

/**
 * Hook para formulário de rotina (cadastro/edição)
 */
export function useRoutineForm(routine?: RoutineDetails) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const { user } = useAuth()

    const defaultProcessingStack = routine?.processing_stack ? JSON.stringify(routine.processing_stack, null, 2) : ROUTINE_FORM_DEFAULTS.processing_stack

    const form = useForm<RoutineFormData>({
        resolver: zodResolver(routineSchema) as any,
        defaultValues: {
            agent_id: routine?.agent_id || "",
            name: routine?.name || "",
            description: routine?.description || ROUTINE_FORM_DEFAULTS.description,
            context: routine?.context || ROUTINE_FORM_DEFAULTS.context,
            phones_to_call: (routine?.phones_to_call as string[]) || ROUTINE_FORM_DEFAULTS.phones_to_call,
            processing_stack: defaultProcessingStack,
            status: routine?.status || ROUTINE_FORM_DEFAULTS.status,
            start_time: routine?.start_time || ROUTINE_FORM_DEFAULTS.start_time,
            end_time: routine?.end_time || ROUTINE_FORM_DEFAULTS.end_time,
            active: routine?.active ?? ROUTINE_FORM_DEFAULTS.active
        }
    })

    // Função para converter data ISO para formato datetime-local
    const convertToDateTimeLocal = (isoString?: string) => {
        if (!isoString) return ""
        try {
            const date = new Date(isoString)
            // Converter para timezone local e formatar para datetime-local
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch (error) {
            console.warn('Erro ao converter data:', error)
            return ""
        }
    }

    // Resetar formulário quando os dados da rotina mudarem
    useEffect(() => {
        if (routine) {
            const processingStackValue = routine.processing_stack ? JSON.stringify(routine.processing_stack, null, 2) : ROUTINE_FORM_DEFAULTS.processing_stack

            form.reset({
                agent_id: routine.agent_id || "",
                name: routine.name || "",
                description: routine.description || ROUTINE_FORM_DEFAULTS.description,
                context: routine.context || ROUTINE_FORM_DEFAULTS.context,
                phones_to_call: (routine.phones_to_call as string[]) || ROUTINE_FORM_DEFAULTS.phones_to_call,
                processing_stack: processingStackValue,
                status: routine.status || ROUTINE_FORM_DEFAULTS.status,
                start_time: convertToDateTimeLocal(routine.start_time || undefined) || ROUTINE_FORM_DEFAULTS.start_time,
                end_time: convertToDateTimeLocal(routine.end_time || undefined) || ROUTINE_FORM_DEFAULTS.end_time,
                active: routine.active ?? ROUTINE_FORM_DEFAULTS.active
            })
        }
    }, [routine, form])

    const onSubmit = useCallback((data: RoutineFormData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        const processSubmit = () => {
            if (routine?.id) {
                // Atualização de rotina existente
                return routinesApi.updateRoutine(routine.id, {
                    agent_id: data.agent_id,
                    name: data.name,
                    description: data.description,
                    context: data.context,
                    phones_to_call: data.phones_to_call,
                    processing_stack: data.processing_stack,
                    status: data.status,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    active: data.active
                })
            } else {
                // Criação de nova rotina
                if (!user?.company_id) {
                    return Promise.reject(new Error('ID da empresa não encontrado'))
                }

                return routinesApi.createRoutine({
                    company_id: user.company_id,
                    agent_id: data.agent_id,
                    name: data.name,
                    description: data.description,
                    context: data.context,
                    phones_to_call: data.phones_to_call,
                    processing_stack: data.processing_stack,
                    status: data.status,
                    start_time: data.start_time,
                    end_time: data.end_time,
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
                    throw new Error(errorMsg || 'Erro ao salvar rotina')
                }

                // Mensagens de sucesso com toast
                if (routine?.id) {
                    // Edição
                    toast.success("Rotina atualizada!", {
                        description: `${data.name} foi atualizada com sucesso.`,
                    })
                } else {
                    // Criação
                    toast.success("Rotina criada!", {
                        description: `${data.name} foi criada com sucesso.`,
                    })
                }

                // Resetar form após sucesso na criação
                if (!routine?.id) {
                    form.reset()
                }

                setIsSubmitting(false)
                return { success: true }
            })
            .catch(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar rotina'

                // Toast de erro
                toast.error("Erro ao salvar rotina", {
                    description: errorMessage,
                })

                setSubmitError(errorMessage)
                setIsSubmitting(false)
                return { success: false, error: errorMessage }
            })
    }, [routine, form, user?.company_id])

    return {
        form,
        isSubmitting,
        submitError,
        onSubmit,
        clearError: () => setSubmitError(null)
    }
}

// ===========================
// Navigation Hook
// ===========================

/**
 * Hook para navegação interna da página de rotinas
 */
export function useRotinasNavigation() {
    const navigate = useNavigate()
    const params = useParams<{ id: string }>()
    const location = useLocation()

    // Determina o modo atual baseado na rota
    const getCurrentMode = useCallback((): RoutineViewMode => {
        const path = location.pathname

        if (path.endsWith('/nova')) return 'create'
        if (params.id && path.endsWith('/editar')) return 'edit'
        if (params.id) return 'view'
        return 'list'
    }, [location.pathname, params.id])

    const mode = getCurrentMode()

    // Navegação
    const goToList = useCallback(() => {
        navigate('/rotinas')
    }, [navigate])

    const goToCreate = useCallback(() => {
        navigate('/rotinas/nova')
    }, [navigate])

    const goToView = useCallback((routineId: string) => {
        navigate(`/rotinas/${routineId}`)
    }, [navigate])

    const goToEdit = useCallback((routineId: string) => {
        navigate(`/rotinas/${routineId}/editar`)
    }, [navigate])

    return {
        mode,
        routineId: params.id,
        goToList,
        goToCreate,
        goToView,
        goToEdit
    }
}

// ===========================
// Routine Detail Hook
// ===========================

/**
 * Hook para buscar detalhes de uma rotina específica
 */
export function useRoutineDetail(routineId?: string) {
    const [routine, setRoutine] = useState<RoutineDetails | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRoutine = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await routinesApi.getRoutine(id)

            if (response.error) {
                throw new Error(response.error.message as string || 'Erro ao buscar rotina')
            }

            const routineData = response.data?.data
            if (!routineData) {
                throw new Error('Dados da rotina não encontrados')
            }

            const routineDetails: RoutineDetails = {
                id: routineData.id,
                company_id: routineData.company_id,
                agent_id: routineData.agent_id,
                agent_name: routineData.agent_name,
                name: routineData.name,
                description: routineData.description,
                context: routineData.context,
                phones_to_call: routineData.phones_to_call,
                processing_stack: routineData.processing_stack,
                active: routineData.active,
                status: routineData.status,
                start_time: routineData.start_time,
                end_time: routineData.end_time,
                success_count: routineData.success_count,
                fail_count: routineData.fail_count,
                created_at: routineData.created_at,
                updated_at: routineData.updated_at,
                deleted_at: routineData.deleted_at || null
            }

            setRoutine(routineDetails)
            setError(null)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(errorMessage)
            console.error('Erro ao buscar rotina:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (routineId) {
            fetchRoutine(routineId)
        } else {
            setRoutine(null)
            setError(null)
        }
    }, [routineId, fetchRoutine])

    return {
        routine,
        isLoading,
        error,
        refetch: () => routineId ? fetchRoutine(routineId) : Promise.resolve()
    }
}

// ===========================
// Main Rotinas Hook
// ===========================

/**
 * Hook principal que integra toda a lógica da página de rotinas
 */
export function useRotinas() {
    const navigation = useRotinasNavigation()
    const rotinasList = useRotinasList()
    const routineDetail = useRoutineDetail(navigation.routineId)

    // Prioriza dados da requisição específica para view/edit
    const currentRoutine = (navigation.mode === 'view' || navigation.mode === 'edit')
        ? routineDetail.routine
        : rotinasList.rotinas.find(routine => routine.id === navigation.routineId)

    // Auto-refresh para listagem
    useEffect(() => {
        if (navigation.mode === 'list') {
            rotinasList.refreshRotinas()
        }
    }, [navigation.mode])

    // Auto-refresh para view/edit quando ID muda
    useEffect(() => {
        if ((navigation.mode === 'view' || navigation.mode === 'edit') && navigation.routineId) {
            routineDetail.refetch()
        }
    }, [navigation.mode, navigation.routineId])

    return {
        // Navigation
        ...navigation,

        // Rotinas List
        rotinas: rotinasList.rotinas,
        isLoading: rotinasList.isLoading || routineDetail.isLoading,
        error: rotinasList.error || routineDetail.error,
        refreshRotinas: rotinasList.refreshRotinas,

        // Current Routine
        currentRoutine,
        refetchRoutine: routineDetail.refetch
    }
}
