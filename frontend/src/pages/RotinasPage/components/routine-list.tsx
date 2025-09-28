import { Eye, Edit, Clock, Phone } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoutineStatusBadge } from "@/components/custom/routine-status-badge"
import { stringLimit } from "@/utils/string"

import type { ColumnDef } from "@tanstack/react-table"
import type { RoutineDetails } from "@/types/routine"
import type { RoutineListProps } from "../types"

// ===========================
// Helper Functions
// ===========================

const getActiveLabel = (active: boolean) => {
    return active ? <Badge>Ativa</Badge> : <Badge variant="outline">Inativa</Badge>
}

const getStatusLabel = (status: string | null | undefined) => {
    return <RoutineStatusBadge status={status} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPhoneCount = (phones: any[] | null) => {
    if (!phones || !Array.isArray(phones)) return 0
    return phones.length
}

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

// ===========================
// RotinesList Component
// ===========================

/**
 * Componente para exibir lista de rotinas em formato de tabela
 */
export function RoutineList({ rotinas, isLoading, onView, onEdit }: RoutineListProps) {
    const columns: ColumnDef<RoutineDetails>[] = [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => (
                <div className="font-medium">
                    {stringLimit(row.original.name, 40)}
                </div>
            ),
        },
        // {
        //     accessorKey: "description",
        //     header: "Descrição",
        //     cell: ({ row }) => {
        //         const description = row.original.description
        //         return description ? stringLimit(description, 50) : (
        //             <span className="text-muted-foreground italic">Sem descrição</span>
        //         )
        //     },
        // },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => getStatusLabel(row.original.status),
        },
        {
            accessorKey: "active",
            header: "Estado",
            cell: ({ row }) => getActiveLabel(row.original.active),
        },
        {
            accessorKey: "phones_to_call",
            header: "Telefones",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {formatPhoneCount(row.original.phones_to_call as any[])}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "start_time",
            header: "Início",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">
                        {formatDateTime(row.original.start_time)}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "success_count",
            header: "Sucessos",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                    {row.original.success_count || 0}
                </Badge>
            ),
        },
        {
            accessorKey: "fail_count",
            header: "Falhas",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                    {row.original.fail_count || 0}
                </Badge>
            ),
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
                                className="h-8 w-8 p-0"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Visualizar detalhes</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row.original)}
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar rotina</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                columns={columns}
                data={rotinas}
                isLoading={isLoading}
            />
        </div>
    )
}
