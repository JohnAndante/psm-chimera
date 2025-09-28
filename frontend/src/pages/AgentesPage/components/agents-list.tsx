import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { AgentDetails } from "@/types/agent"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { stringLimit } from "@/utils/string"

// ===========================
// Helper Functions
// ===========================

const getActiveLabel = (active: boolean) => {
    return active ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/70">
            Ativo
        </Badge>
    ) : (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-900/70">
            Inativo
        </Badge>
    )
}

const getVoiceLabel = (voiceName: string, voiceGender: 'male' | 'female') => {
    const displayText = voiceName || "Sem voz"

    if (voiceGender === 'female') {
        return (
            <Badge
                variant="outline"
                className="bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-900/70"
            >
                {displayText}
            </Badge>
        )
    }

    return (
        <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/70"
        >
            {displayText}
        </Badge>
    )
}

// ===========================
// AgentsList Component
// ===========================

interface AgentsListProps {
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
 * Componente de listagem de agentes
 * Reutiliza o DataTable existente com ações customizadas
 */
export function AgentsList({
    agentes,
    isLoading,
    onView,
    onEdit,
    onDelete,
}: AgentsListProps) {

    // Definição das colunas da tabela
    const columns: ColumnDef<AgentDetails>[] = [
        {
            accessorKey: "name",
            header: "Nome do agente",
        },
        {
            accessorKey: "objective",
            header: "Objetivo",
            cell: ({ row }) => stringLimit(row.original.objective, 30),
        },
        {
            accessorKey: "voice_name",
            header: "Voz",
            cell: ({ row }) => getVoiceLabel(row.original.voice_name, row.original.voice_gender),
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => getActiveLabel(row.original.active),
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(row.original.id)}
                                title="Visualizar"
                                className="cursor-pointer"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Visualizar</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row.original)}
                                title="Editar"
                                className="cursor-pointer"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>

                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row.original.id)}
                            title="Excluir"
                            className="text-destructive hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            {/* Tabela de agentes */}
            <DataTable
                columns={columns}
                data={agentes}
                isLoading={isLoading}
                showPagination
            />
        </div>
    )
}
