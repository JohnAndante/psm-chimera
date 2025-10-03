import { LogoPSM } from "@/components/smart-svgs/logo-psm";

/**
 * Componente do cabeçalho da página de login
 * Contém logo, nome e descrição do sistema
 */
export function LoginHeader() {
    return (
        <div className="flex flex-col gap-2 text-center items-center select-none text-white shadow-primary">
            <LogoPSM size={96} />

            <h1 className="text-2xl font-medium">PSM Chimera</h1>

            <p>Painel administrativo de configurações</p>
        </div>
    );
}
