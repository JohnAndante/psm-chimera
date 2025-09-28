import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TextareaWithCounter } from "@/components/custom/textarea-with-counter"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Type, Plus, X, GripVertical, Clock, AlertTriangle } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { useState } from "react"
import React from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ROUTINE_FORM_PHONES_TO_CALL_TEXT, ROUTINE_STATUS_LABELS } from "@/constants/routine"
import type { RoutineFormData } from "../../types"
import type { AgentDetails } from "@/types/agent"
import { ROUTINE_VALIDATION } from "@/constants/routine"

// ===========================
// Agent Selection Field
// ===========================

/**
 * Campo de seleção de agente responsável
 */
export function RoutineAgentField({ agents, isLoading }: { agents: AgentDetails[], isLoading: boolean }) {
    const { control, watch } = useFormContext<RoutineFormData>()
    const selectedAgentId = watch("agent_id")

    // Filtrar apenas agentes ativos
    const activeAgents = agents.filter(agent => agent.active)

    // Encontrar agente selecionado
    const selectedAgent = activeAgents.find(agent => agent.id === selectedAgentId)

    return (
        <FormField
            control={control}
            name="agent_id"
            render={({ field }) => (
                <FormItem className="">
                    <FormLabel>Agente Responsável *</FormLabel>
                    <div className="grid grid-cols-2 gap-4">

                        {/* Select - Seletor de agente */}
                        <div className="space-y-2">
                            <FormLabel className="text-sm font-medium text-muted-foreground" htmlFor="agent-id">
                                Selecione um agente responsável
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={isLoading ? "Carregando agentes..." : "Selecione um agente"}>
                                            {field.value && selectedAgent ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{selectedAgent.name}</span>
                                                    <Badge
                                                        variant="default"
                                                        className="text-xs bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/70"
                                                    >
                                                        Ativo
                                                    </Badge>
                                                </div>
                                            ) : "Selecione um agente"}
                                        </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {activeAgents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-medium">{agent.name}</span>
                                                    <Badge
                                                        variant="default"
                                                        className="text-xs ml-2 bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/70"
                                                    >
                                                        Ativo
                                                    </Badge>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </div>

                        {/* Informações do agente selecionado - Ocupa a outra metade */}
                        <div className="space-y-2">
                            <FormLabel className="text-sm font-medium text-muted-foreground" htmlFor="agent-info">
                                Informações do Agente
                            </FormLabel>
                            <div className="min-h-[37px] px-3 py-1 border border-input bg-muted/30 rounded-md flex items-center" id="agent-info">
                                {selectedAgent ? (
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{selectedAgent.name}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${selectedAgent.voice_gender === 'female'
                                                    ? 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-900/70'
                                                    : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/70'
                                                    }`}
                                            >
                                                {selectedAgent.voice_gender === 'male' ? 'Masculino' : 'Feminino'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Voz: {selectedAgent.voice_name}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Selecione um agente para ver as informações
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </FormItem>
            )}
        />
    )
}

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

interface SortableStackItemProps {
    item: ProcessingStackItem
    index: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateStackItem: (id: number, field: keyof ProcessingStackItem, value: any) => void
    removeStackItem: (id: number) => void
}

/**
 * Componente sortable para cada item da stack
 */
function SortableStackItem({ item, index, updateStackItem, removeStackItem }: SortableStackItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`relative gap-1 ${isDragging ? 'shadow-lg z-10' : ''}`}
        >
            <CardHeader>
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
                        {/* Drag Handle */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>

                        {/* Remove Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStackItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Nome da Etapa */}
                <FormItem className="space-y-2">
                    <FormLabel
                        className="text-sm font-medium mb-0"
                        htmlFor={`name-${item.id}`}>
                        Nome da Etapa
                    </FormLabel>
                    <FormControl>
                        <Input
                            id={`name-${item.id}`}
                            placeholder="Ex: Abertura Obrigatória"
                            value={item.name}
                            onChange={(e) => updateStackItem(item.id, 'name', e.target.value)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Descrição */}
                <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium mb-0" htmlFor={`description-${item.id}`}>Descrição/Script</FormLabel>
                    <FormControl>
                        <Textarea
                            id={`description-${item.id}`}
                            placeholder="Descreva o que deve ser feito nesta etapa..."
                            rows={3}
                            value={item.description}
                            onChange={(e) => updateStackItem(item.id, 'description', e.target.value)}
                            className="text-sm"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Duração e Obrigatório */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem className="space-y-2">
                        <FormLabel
                            className="text-sm font-medium mb-1.5"
                            htmlFor={`duration_estimate-${item.id}`}>
                            Duração (segundos)
                        </FormLabel>
                        <FormControl>
                            <Input
                                id={`duration_estimate-${item.id}`}
                                min="0"
                                value={item.duration_estimate}
                                onChange={e => updateStackItem(
                                    item.id,
                                    'duration_estimate',
                                    parseInt(e.target.value.replace(/[^0-9]/g, '')
                                    ) || 0)}
                                inputMode="numeric"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>

                    <FormItem className="">
                        <FormLabel
                            className="text-sm font-medium mb-0"
                            htmlFor={`required-${item.id}`}>
                            Configurações
                        </FormLabel>
                        <FormControl className="mt-0 mb-1">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`required-${item.id}`}
                                    checked={item.required}
                                    onCheckedChange={(checked) => updateStackItem(item.id, 'required', checked)}
                                />
                                <FormLabel className="text-sm font-normal" htmlFor={`required-${item.id}`}>Etapa obrigatória</FormLabel>
                            </div>
                        </FormControl>
                    </FormItem>
                </div >
            </CardContent >
        </Card >
    )
}

// ===========================
// Form Field Components
// ===========================

/**
 * Campo Nome da rotina
 */
export function RoutineNameField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Nome da Rotina *</FormLabel>
                    <FormControl>
                        <Input
                            placeholder="Digite o nome da rotina..."
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
 * Campo Descrição da rotina (opcional)
 */
export function RoutineDescriptionField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                        <TextareaWithCounter
                            placeholder="Descreva o propósito e funcionamento da rotina (opcional)..."
                            rows={3}
                            showCharCount={true}
                            showWordCount={false}
                            maxLength={ROUTINE_VALIDATION.DESCRIPTION.MAX_LENGTH}
                            {...field}
                            value={field.value || ""}
                            defaultValue={field.value || ""}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Contexto da rotina (opcional)
 */
export function RoutineContextField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="context"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Contexto</FormLabel>
                    <FormControl>
                        <TextareaWithCounter
                            placeholder="Informações contextuais relevantes para a execução da rotina (opcional)..."
                            rows={4}
                            showCharCount={true}
                            showWordCount={false}
                            maxLength={1000}
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
 * Campo Stack de Processamento Visual (obrigatório)
 */
export function RoutineProcessingStackField() {
    const { control, watch, setValue } = useFormContext<RoutineFormData>()
    const [stackItems, setStackItems] = useState<ProcessingStackItem[]>([])

    // Sensores para drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Função para adicionar nova stack
    const addStackItem = () => {
        const newId = Math.max(...stackItems.map(item => item.id), 0) + 1
        const newItem: ProcessingStackItem = {
            id: newId,
            name: "",
            description: "",
            duration_estimate: 30,
            required: false
        }

        const newStack = [...stackItems, newItem]
        setStackItems(newStack)
        setValue("processing_stack", JSON.stringify(newStack))
    }

    // Função para remover stack
    const removeStackItem = (id: number) => {
        const newStack = stackItems.filter(item => item.id !== id)
        setStackItems(newStack)
        setValue("processing_stack", JSON.stringify(newStack))
    }

    // Função para atualizar stack item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateStackItem = (id: number, field: keyof ProcessingStackItem, value: any) => {
        const newStack = stackItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        )
        setStackItems(newStack)
        setValue("processing_stack", JSON.stringify(newStack))
    }

    // Handler do drag and drop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setStackItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)

                const newStack = arrayMove(items, oldIndex, newIndex)
                setValue("processing_stack", JSON.stringify(newStack))
                return newStack
            })
        }
    }

    // Inicializar com dados existentes se houver
    const existingStack = watch("processing_stack")

    // Parse inicial dos dados
    React.useEffect(() => {
        if (existingStack && typeof existingStack === 'string' && existingStack.trim() !== '') {
            try {
                const parsed = JSON.parse(existingStack)
                if (Array.isArray(parsed)) {
                    setStackItems(parsed)
                }
            } catch (error) {
                console.warn('Erro ao parsear stack existente:', error)
            }
        } else if (!existingStack || existingStack.trim() === '') {
            // Se não há dados, inicializar com array vazio
            setStackItems([])
            setValue("processing_stack", JSON.stringify([]))
        }
    }, [existingStack, setValue])

    return (
        <FormField
            control={control}
            name="processing_stack"
            render={() => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4" />
                            Stack de Processamento *
                        </FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addStackItem}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Etapa
                        </Button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="space-y-4">
                            {stackItems.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg select-none">
                                    <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Nenhuma etapa configurada</p>
                                    <p className="text-sm">Clique em "Adicionar Etapa" para começar</p>
                                </div>
                            ) : (
                                <SortableContext
                                    items={stackItems.map(item => item.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {stackItems.map((item, index) => (
                                        <SortableStackItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            updateStackItem={updateStackItem}
                                            removeStackItem={removeStackItem}
                                        />
                                    ))}
                                </SortableContext>
                            )}
                        </div>
                    </DndContext>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Telefones para chamada (opcional, array)
 * Suporta dois modos: lista de itens ou texto livre
 */
export function RoutinePhonesField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="phones_to_call"
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Telefones (Texto) *
                        </FormLabel>
                    </div>

                    <div className="space-y-2">
                        <FormControl>
                            <TextareaWithCounter
                                placeholder={ROUTINE_FORM_PHONES_TO_CALL_TEXT}
                                rows={4}
                                className="font-mono text-sm min-h-[250px]"
                                showCharCount={true}
                                showWordCount={false}
                                maxLength={2000}
                                value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ""}
                                onChange={(e) => {
                                    const text = e.target.value
                                    const phones = text.split(/[,;]/).map(phone => phone.trim()).filter(phone => phone.length > 0)
                                    field.onChange(phones)
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                            Use vírgula (,) ou ponto e vírgula (;) para separar os telefones.
                            <br />
                            Telefones inválidos são automaticamente filtrados.
                        </p>
                    </div>
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Status da rotina (opcional)
 */
export function RoutineStatusField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="status"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.entries(ROUTINE_STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

/**
 * Campo Horário de Início (opcional)
 */
export function RoutineStartTimeField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="start_time"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                        <Input
                            type="datetime-local"
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
 * Campo Horário de Fim (opcional)
 */
export function RoutineEndTimeField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="end_time"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Horário de Fim</FormLabel>
                    <FormControl>
                        <Input
                            type="datetime-local"
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
 * Campo Status Ativo da rotina
 */
export function RoutineActiveField() {
    const { control } = useFormContext<RoutineFormData>()

    return (
        <FormField
            control={control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="flex flex-col items-start">
                            <div className="text-sm font-medium">
                                Rotina Ativa
                            </div>
                            <div className="text-sm font-normal text-muted-foreground">
                                Define se a rotina está habilitada para execução
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
