import { useFormContext } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { TextareaWithCounter } from "@/components/custom/textarea-with-counter"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { AGENT_VALIDATION } from "@/constants/agent"
import type { Voice } from "@/types"
import type { AgentFormData } from "@/pages/AgentesPage/types"

// ===========================
// Form Field Components
// ===========================

/**
 * Campo Nome do agente
 */
export function AgentNameField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Nome do Agente *</FormLabel>
                    <FormControl>
                        <Input
                            placeholder="Ex: Atendente Virtual"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Descrição/Persona do agente
 */
export function AgentDescriptionField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Descrição/Persona *</FormLabel>
                    <FormControl>
                        <TextareaWithCounter
                            placeholder="Descreva a persona do agente, sua função e características principais..."
                            rows={3}
                            showWordCount={false}
                            showCharCount={true}
                            maxLength={AGENT_VALIDATION.DESCRIPTION.MAX_LENGTH}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Objetivo do agente
 */
export function AgentObjectiveField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="objective"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Objetivo *</FormLabel>
                    <FormControl>
                        <TextareaWithCounter
                            placeholder="Qual é o objetivo principal deste agente? Ex: Atender clientes, qualificar leads, etc."
                            rows={3}
                            showWordCount={false}
                            showCharCount={true}
                            maxLength={AGENT_VALIDATION.OBJECTIVE.MAX_LENGTH}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Personalidade do agente
 */
export function AgentPersonalityField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="personality"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Personalidade *</FormLabel>
                    <FormControl>
                        <TextareaWithCounter
                            placeholder="Descreva a personalidade do agente: tom de voz, estilo de comunicação, características comportamentais..."
                            rows={3}
                            showWordCount={false}
                            showCharCount={true}
                            maxLength={AGENT_VALIDATION.PERSONALITY.MAX_LENGTH}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo de Voz do agente
 */
export function AgentVoiceField({ voices }: { voices: Voice[] }) {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="voice_id"
            render={({ field }) => {
                const selectedVoice = field.value ? voices.find(voice => voice.id === field.value) : null

                return (
                    <FormItem className="">
                        <FormLabel>Voz *</FormLabel>
                        <div className="grid grid-cols-2 gap-4">

                            {/* Select - Seletor de voz */}
                            <div className="space-y-2">
                                <FormLabel className="text-sm font-medium text-muted-foreground" htmlFor="voice-id">
                                    Selecione uma voz para o agente
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione uma voz">
                                                {field.value && selectedVoice ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>{selectedVoice.name}</span>
                                                        <Badge
                                                            variant={selectedVoice.gender === 'male' ? 'default' : 'secondary'}
                                                            className={`text-xs ${selectedVoice.gender === 'female'
                                                                ? 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-900/70'
                                                                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/70'
                                                                }`}
                                                        >
                                                            {selectedVoice.gender === 'male' ? 'Masculino' : 'Feminino'}
                                                        </Badge>
                                                    </div>
                                                ) : "Selecione uma voz"}
                                            </SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {voices.map((voice) => (
                                            <SelectItem key={voice.id} value={voice.id}>
                                                <div className="flex flex-col w-full">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{voice.name}</span>
                                                        <Badge
                                                            variant={voice.gender === 'male' ? 'default' : 'secondary'}
                                                            className={`text-xs ml-2 ${voice.gender === 'female'
                                                                ? 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-900/70'
                                                                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/70'
                                                                }`}
                                                        >
                                                            {voice.gender === 'male' ? 'Masculino' : 'Feminino'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </div>

                            {/* Descrição da voz selecionada - Ocupa a outra metade */}
                            <div className="space-y-2">
                                <FormLabel className="text-sm font-medium text-muted-foreground" htmlFor="voice-description">
                                    Descrição da Voz
                                </FormLabel>
                                <div className="min-h-[37px] px-3 py-1 border border-input bg-muted/30 rounded-md flex items-center" id="voice-description">
                                    {selectedVoice ? (
                                        <p className="text-sm text-foreground">
                                            {selectedVoice.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Selecione uma voz para ver a descrição
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FormItem>
                )
            }}
        />
    )
}

/**
 * Campo Mensagem de Apresentação (opcional)
 */
export function AgentPresentationField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="presentation_message"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Mensagem de Apresentação</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Mensagem que o agente usará para se apresentar aos clientes (opcional)..."
                            rows={4}
                            {...field}
                            value={field.value || ""}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Status Ativo do agente
 */
export function AgentActiveField() {
    const { control } = useFormContext<AgentFormData>()

    return (
        <FormField
            control={control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="flex flex-col items-start">
                            <div className="text-sm font-medium">
                                Status do Agente
                            </div>
                            <div className="text-sm font-normal text-muted-foreground">
                                Quando ativo, o agente poderá receber chamadas e interações
                            </div>
                        </FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    )
}
