import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

// ===========================
// RoutineErrorAlert Component
// ===========================

interface RoutineErrorAlertProps {
    /** Mensagem de erro para exibir */
    error: string
    /** Callback para fechar o alert */
    onDismiss: () => void
}

/**
 * Componente de alert de erro padronizado para formulários de rotina
 * Exibe erros de validação ou API de forma consistente
 */
export function RoutineErrorAlert({ error, onDismiss }: RoutineErrorAlertProps) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                >
                    <X className="h-4 w-4" />
                </Button>
            </AlertDescription>
        </Alert>
    )
}
