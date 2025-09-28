import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, X, Bot } from "lucide-react"
import { useAgentForm } from "../hooks"
import type { AgentFormProps } from "../types"
import type { AgentFormData } from "../types"
import {
    AgentErrorAlert,
    AgentNameField,
    AgentDescriptionField,
    AgentObjectiveField,
    AgentPersonalityField,
    AgentVoiceField,
    AgentActiveField
} from "./form"

// ===========================
// AgentForm Component
// ===========================

/**
 * Componente de formulário para cadastro/edição de agente
 * Segue o padrão da LoginPage com componentes organizados
 */
export function AgentForm({
    agent,
    onSave,
    onCancel,
    isLoading = false
}: AgentFormProps) {
    const {
        form,
        isSubmitting,
        submitError,
        onSubmit,
        clearError,
        voices
    } = useAgentForm(agent)

    const isEditing = !!agent

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (data: any) => {
        // Limpa erro anterior
        if (submitError) {
            clearError()
        }

        const result = await onSubmit(data as AgentFormData)
        if (result.success) {
            onSave()
        }
    }

    // Se estiver carregando, mostra skeletons
    if (isLoading) {
        return (
            <div className="mx-auto max-w-4xl">
                <Card>
                    <CardContent className="px-6">
                        <div className="space-y-6">
                            {/* Ícone discreto do bot */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Bot className="h-4 w-4" />
                                <span className="text-sm">Configuração do Agente</span>
                            </div>

                            <div className="grid gap-6">
                                {/* Linha 1: Nome e Status - Skeleton */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>

                                <Separator />

                                {/* Linha 2: Descrição - Skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-20 w-full" />
                                </div>

                                <Separator />

                                {/* Linha 3: Objetivo - Skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-20 w-full" />
                                </div>

                                <Separator />

                                {/* Linha 4: Personalidade - Skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-24 w-full" />
                                </div>

                                <Separator />

                                {/* Linha 5: Voz - Skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            {/* Botões - Skeleton */}
                            <div className="flex justify-end gap-3 pt-6">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardContent className="px-6">
                    <div className="space-y-6">
                        {/* Erro da API */}
                        {submitError && (
                            <AgentErrorAlert error={submitError} />
                        )}

                        {/* Formulário */}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                {/* Ícone discreto do bot */}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Bot className="h-4 w-4" />
                                    <span className="text-sm">Configuração do Agente</span>
                                </div>

                                <div className="grid gap-6">

                                    {/* Linha 1: Nome e Status - Responsivo */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <AgentNameField />
                                        <AgentActiveField />
                                    </div>

                                    {/* Linha 2: Tipo de voz */}
                                    <AgentVoiceField voices={voices} />

                                    {/* Linha 3: Descrição */}
                                    <AgentDescriptionField />

                                    {/* Linha 4: Objetivo */}
                                    <AgentObjectiveField />

                                    {/* Linha 5: Personalidade */}
                                    <AgentPersonalityField />
                                </div>

                                <Separator />

                                {/* Ações */}
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto cursor-pointer"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            "Salvando..."
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {isEditing ? 'Atualizar' : 'Criar'} Agente
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
