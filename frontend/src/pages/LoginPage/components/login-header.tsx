import { LogoPSM } from "@/components/smart-svgs/logo-psm";

/**
 * Componente do cabeçalho da página de login
 * Contém logo, nome e descrição do sistema
 */
export function LoginHeader() {
    return (
        <div className="flex flex-col gap-2 text-center items-center select-none">
            <LogoPSM size={96} />

            <h1 className="text-2xl font-medium text-muted">PSM Chimera</h1>

            <p className="text-muted">Painel administrativo de configurações</p>
        </div>
    );
}
