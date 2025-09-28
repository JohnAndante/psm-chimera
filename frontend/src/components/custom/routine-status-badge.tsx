import { Badge } from "@/components/ui/badge"
import { ROUTINE_STATUS_BADGE_CONFIG } from "@/constants/routine"

type RoutineStatus = keyof typeof ROUTINE_STATUS_BADGE_CONFIG

interface RoutineStatusBadgeProps {
    status: RoutineStatus | string | null | undefined
    className?: string
}

/**
 * Badge de status para rotinas
 * Exibe o status com cores apropriadas
 */
export function RoutineStatusBadge({
    status,
    className = ""
}: RoutineStatusBadgeProps) {
    if (!status) {
        return (
            <Badge variant="outline" className={`${className}`}>
                Sem status
            </Badge>
        )
    }

    const config = ROUTINE_STATUS_BADGE_CONFIG[status as RoutineStatus]

    if (!config) {
        return (
            <Badge variant="outline" className={`${className}`}>
                {status}
            </Badge>
        )
    }

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${className}`}
        >
            {config.label}
        </Badge>
    )
}
