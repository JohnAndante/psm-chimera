import { AUTH_STORAGE_KEYS, AUTH_CONFIG } from "@/constants/auth";
import type { StoredAuthData } from "@/types/auth";
import type { JwtPayload } from "jwt-decode";

// ===========================
// JWT Utilities
// ===========================

/**
 * Decodifica um token JWT (apenas o payload, sem validação de assinatura)
 * IMPORTANTE: Esta função apenas decodifica o payload para uso no frontend.
 * A validação real do token deve ser feita no backend.
 */
export function decodeJWT(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        const payload = parts[1];
        // Adiciona padding se necessário
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decoded = atob(paddedPayload);

        return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
        console.warn('Failed to decode JWT:', error);
        return null;
    }
}

/**
 * Verifica se um token JWT expirou
 * @param token Token JWT para verificar
 * @param bufferSeconds Buffer de tempo em segundos antes da expiração (padrão: 300s = 5min)
 */
export function isTokenExpired(token: string, bufferSeconds = 300): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.iat) {
        return true;
    }

    // Calcula a expiração baseada no iat + duração padrão
    const expirationTime = (payload.iat * 1000) + AUTH_CONFIG.DEFAULT_TOKEN_DURATION;
    const now = Date.now();
    const bufferTime = bufferSeconds * 1000;

    return (expirationTime - bufferTime) <= now;
}

/**
 * Salva dados de autenticação no storage apropriado
 * @param data Dados para salvar (token, user, expiresAt)
 * @param rememberMe Se true, salva no localStorage; se false, sessionStorage
 */
export function saveAuthData(data: StoredAuthData, rememberMe = false): void {
    try {
        if (rememberMe) {
            // localStorage para "lembrar de mim"
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
            localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');

            if (data.expiresAt) {
                localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, data.expiresAt.toString());
            }
        } else {
            // sessionStorage para sessão temporária
            sessionStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
            sessionStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));

            // Remove dados antigos do localStorage se existirem
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
            localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
            localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
        }
    } catch (error) {
        console.error('Failed to save auth data:', error);
    }
}

/**
 * Remove todos os dados de autenticação salvos
 */
export function removeAuthData(): void {
    try {
        // Remove do localStorage
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_AT);

        // Remove do sessionStorage
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    } catch (error) {
        console.error('Failed to remove auth data:', error);
    }
}


/**
 * Carrega dados de autenticação salvos
 */
export function loadAuthData(): StoredAuthData | null {
    try {
        // Verifica primeiro o localStorage (remember me)
        let token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        let userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
        let expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);

        // Se não encontrou no localStorage, verifica sessionStorage
        if (!token || !userJson) {
            token = sessionStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
            userJson = sessionStorage.getItem(AUTH_STORAGE_KEYS.USER);
            expiresAt = null;
        }

        if (!token || !userJson) {
            return null;
        }

        // Verifica se não expirou
        if (expiresAt && parseInt(expiresAt) < Date.now()) {
            removeAuthData();
            return null;
        }

        // Verifica se o token não expirou
        if (isTokenExpired(token)) {
            removeAuthData();
            return null;
        }

        const user = JSON.parse(userJson);

        return {
            token,
            user,
            expiresAt: expiresAt ? parseInt(expiresAt) : undefined,
        };
    } catch (error) {
        console.error('Failed to load auth data:', error);
        removeAuthData();
        return null;
    }
}


/**
 * Extrai token do localStorage/sessionStorage para uso em headers
 */
export function getCurrentToken(): string | null {
    const authData = loadAuthData();
    return authData?.token || null;
}
