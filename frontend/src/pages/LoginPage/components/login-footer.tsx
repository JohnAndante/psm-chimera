/**
 * Componente do rodapé da página de login
 * Contém informações de copyright
 */
export function LoginFooter() {
    return (
        <p className="text-center text-xs text-gray-300">
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Walker Silvestre. Todos os direitos reservados.
        </p>
    );
}
