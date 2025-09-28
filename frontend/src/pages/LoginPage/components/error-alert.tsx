interface ErrorAlertProps {
    /** Mensagem de erro a ser exibida */
    error: string;
}

/**
 * Componente para exibir erros da API
 * Estilo padronizado para mensagens de erro
 */
export function ErrorAlert({ error }: ErrorAlertProps) {
    return (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
        </div>
    );
}
