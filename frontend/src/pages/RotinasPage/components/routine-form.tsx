import { FormProvider } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, X, Info, ListTreeIcon, PhoneIcon, Cog } from "lucide-react"
import { useRoutineForm, useRoutineAgents } from "../hooks"
import type { RoutineFormProps, RoutineFormData } from "../types"
import {
    RoutineErrorAlert,
    RoutineAgentField,
    RoutineNameField,
    RoutineDescriptionField,
    RoutineContextField,
    RoutinePhonesField,
    RoutineProcessingStackField,
    RoutineStartTimeField,
    RoutineEndTimeField,
    RoutineActiveField
} from "@/pages/RotinasPage/components/form"
import { Separator } from "@/components/ui/separator"

// ===========================
// RotinesForm Component
// ===========================

/**
 * Formulário para criação e edição de rotinas
 * Usa react-hook-form com validação Zod
 */
export function RoutineForm({ routine, onSuccess, onCancel }: RoutineFormProps) {
    const { form, isSubmitting, submitError, onSubmit, clearError } = useRoutineForm(routine)
    const { agents, isLoading: agentsLoading } = useRoutineAgents()
    const isEditing = Boolean(routine?.id)

    const handleSubmit = form.handleSubmit((data) => {
        onSubmit(data as RoutineFormData).then((result) => {
            if (result?.success && onSuccess) {
                onSuccess()
            }
        })
    })

    return (
        <div className="max-w-4xl mx-auto">
            <FormProvider {...form}>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="px-6">
                            <div className="flex items-center gap-2 mb-6 ">
                                <Cog className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Configuração da Rotina
                                </span>
                            </div>

                            {/* Alert de erro */}
                            {submitError && (
                                <div className="mb-6">
                                    <RoutineErrorAlert error={submitError} onDismiss={clearError} />
                                </div>
                            )}

                            <div className="space-y-6">

                                {/* Linha 1: Nome + Status Ativo (responsivo) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <RoutineNameField />
                                    <RoutineActiveField />
                                </div>

                                {/* Linha 2: Agente Responsável */}
                                <RoutineAgentField agents={agents} isLoading={agentsLoading} />

                                {/* Linha 3: Status + Datas (responsivo) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* <RoutineStatusField /> */}
                                    <RoutineStartTimeField />
                                    <RoutineEndTimeField />
                                </div>

                                <Separator />

                                <div className="flex items-center gap-2 mb-6 ">
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Detalhes da Rotina
                                    </span>
                                </div>

                                {/* Linha 4: Descrição */}
                                <RoutineDescriptionField />

                                {/* Linha 5: Contexto */}
                                <RoutineContextField />

                                <Separator />

                                <div className="flex items-center gap-2 mb-6 ">
                                    <ListTreeIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Stacks
                                    </span>
                                </div>

                                {/* Linha 6: Stack de Processamento */}
                                <RoutineProcessingStackField />

                                <Separator />

                                <div className="flex items-center gap-2 mb-6 ">
                                    <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Telefones
                                    </span>
                                </div>

                                {/* Linha 7: Telefones */}
                                <RoutinePhonesField />

                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-6">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        )}

                        {/* Alinhar os botões de salvar e cancelar */}
                        <div className="flex items-center gap-4">
                            <>
                                {onCancel && (
                                    <Button
                                        type="button"
                                        variant="outline"

                                        disabled={isSubmitting}
                                        className="cursor-pointer"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                )}
                            </>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isEditing ? 'Atualizar Rotina' : 'Criar Rotina'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
