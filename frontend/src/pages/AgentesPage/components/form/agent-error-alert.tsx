import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

// ===========================
// Agent Error Alert Component
// ===========================

interface AgentErrorAlertProps {
    /** Mensagem de erro */
    error: string
}

/**
 * Componente para exibir erros de API no formulário de agente
 * Reutilizável para diferentes tipos de erro
 */
export function AgentErrorAlert({ error }: AgentErrorAlertProps) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
    )
}
