import type { User } from "@/stores/auth"

/**
 * Verifica se o usuário é administrador
 * @param user - Objeto do usuário
 * @returns true se o usuário for ADMIN, false caso contrário
 */
export function isAdmin(user: User | null): boolean {
    return user?.role === 'ADMIN'
}
