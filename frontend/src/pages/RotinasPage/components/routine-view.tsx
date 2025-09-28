/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { RoutineStatusBadge } from "@/components/custom/routine-status-badge"
import { Calendar, Clock, Phone, Settings, MessageSquare, BarChart3, AlertTriangle, GripVertical } from "lucide-react"
import type { RoutineViewProps } from "../types"

// ===========================
// Types
// ===========================

interface ProcessingStackItem {
    id: number
    name: string
    description: string
    duration_estimate: number
    required: boolean
}

// ===========================
// Components
// ===========================

/**
 * Componente para exibir uma etapa da processing stack em modo read-only
 */
function ProcessingStackViewCard({ item, index }: { item: ProcessingStackItem, index: number }) {
    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            #{index + 1}
                        </Badge>
                        {item.required && (
                            <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Obrigatório
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.duration_estimate}s
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                </div>

                {item.name && (
                    <div className="mt-2">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                    </div>
                )}
            </CardHeader>

            {item.description && (
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Descrição/Script
                        </label>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.description}
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

// ===========================
// Helper Functions
// ===========================

const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Não definido"

    try {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return "Data inválida"
    }
}

const getActiveStatus = (active: boolean) => {
    return active ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Ativa
        </Badge>
    ) : (
        <Badge variant="outline" className="text-gray-600">
            Inativa
        </Badge>
    )
}

const getStatusBadge = (status: string | null | undefined) => {
    return <RoutineStatusBadge status={status} />
}

const formatPhonesList = (phones: any[] | null) => {
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
        return "Nenhum telefone configurado"
    }
    return phones.join(", ")
}

const parseProcessingStack = (stack: any): ProcessingStackItem[] => {
    if (!stack) return []

    try {
        let parsed: any

        if (typeof stack === 'string') {
            parsed = JSON.parse(stack)
        } else {
            parsed = stack
        }

        if (Array.isArray(parsed)) {
            return parsed.filter(item =>
                item &&
                typeof item === 'object' &&
                'id' in item &&
                'name' in item
            )
        }

        return []
    } catch {
        return []
    }
}

// ===========================
// RotinesView Component
// ===========================

/**
 * Componente para visualizar detalhes completos de uma rotina
 */
export function RoutineView({ routine, isLoading = false }: RoutineViewProps) {
    // Se estiver carregando ou não tiver rotina, mostra skeletons
    if (isLoading || !routine) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Card Principal - Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>

                {/* Card de Estatísticas - Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Card de Processing Stack - Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-5 w-8" />
                                                <Skeleton className="h-5 w-16" />
                                                <Skeleton className="h-5 w-12" />
                                            </div>
                                            <Skeleton className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Card Principal - Informações Básicas */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {routine.name}
                            </CardTitle>
                            {routine.description && (
                                <CardDescription className="mt-2">
                                    {routine.description}
                                </CardDescription>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 items-end">
                            {getActiveStatus(routine.active)}
                            {getStatusBadge(routine.status)}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Agente Responsável */}
                    {routine.agent_name && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Agente Responsável
                                </label>
                                <p className="text-sm mt-1 font-medium">
                                    {routine.agent_name}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Contexto */}
                    {routine.context && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Contexto
                                </label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                                    {routine.context}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Telefones */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Telefones para Ligação
                        </label>
                        <p className="text-sm mt-1">
                            {formatPhonesList(routine.phones_to_call as any[])}
                        </p>
                    </div>

                    <Separator />

                    {/* Horários */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Horário de Início
                            </label>
                            <p className="text-sm mt-1">
                                {formatDateTime(routine.start_time)}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Horário de Fim
                            </label>
                            <p className="text-sm mt-1">
                                {formatDateTime(routine.end_time)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card de Estatísticas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Estatísticas de Execução
                    </CardTitle>
                    <CardDescription>
                        Contadores de sucessos e falhas da rotina
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {routine.success_count || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Execuções com Sucesso
                            </div>
                        </div>

                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {routine.fail_count || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Execuções com Falha
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card de Metadados */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Informações do Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                ID da Rotina
                            </label>
                            <p className="text-sm mt-1 font-mono">
                                {routine.id}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                ID da Empresa
                            </label>
                            <p className="text-sm mt-1 font-mono">
                                {routine.company_id}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Criado em
                            </label>
                            <p className="text-sm mt-1">
                                {formatDateTime(routine.created_at)}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Atualizado em
                            </label>
                            <p className="text-sm mt-1">
                                {formatDateTime(routine.updated_at)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card de Stack de Processamento */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5" />
                        Stack de Processamento
                    </CardTitle>
                    <CardDescription>
                        Etapas configuradas da rotina de automação
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(() => {
                        const stackItems = parseProcessingStack(routine.processing_stack)

                        if (stackItems.length === 0) {
                            return (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg select-none">
                                    <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Nenhuma etapa configurada</p>
                                    <p className="text-sm">Esta rotina não possui etapas definidas</p>
                                </div>
                            )
                        }

                        return (
                            <div className="space-y-4">
                                {stackItems.map((item, index) => (
                                    <ProcessingStackViewCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )
                    })()}
                </CardContent>
            </Card>
        </div>
    )
}
