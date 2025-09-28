import { create } from "zustand"
import { saveAuthData, loadAuthData, removeAuthData } from "@/lib/auth"
import type { LoginUserData } from "@/types/auth"

export type User = {
    id: string
    email: string
    role?: string
    name?: string
    avatar?: string
    company_id?: string
    company_name?: string
    lastLogin?: string | null
}

type AuthState = {
    user: User | null
    token: string | null
    profileModalOpen: boolean
    setProfileModalOpen: (open: boolean) => void
    login: (token: string, user: LoginUserData, remember?: boolean) => void
    logout: () => void
    loadFromStorage: () => void
    isAuthenticated: () => boolean
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    token: null,
    profileModalOpen: false,

    setProfileModalOpen: (open: boolean) => set({ profileModalOpen: open }),

    login: (token, apiUser, remember = false) => {

        // Converte LoginUserData para User
        const user: User = {
            id: apiUser.id,
            email: apiUser.email,
            name: apiUser.name,
            role: apiUser.role,
            company_id: apiUser.company_id,
            company_name: apiUser.company_name,
            lastLogin: apiUser.lastLogin ? apiUser.lastLogin : null
        }

        // Calcula expiração (24h para remember=true)
        const expiresAt = remember ? Date.now() + (24 * 60 * 60 * 1000) : undefined

        // ✅ Usa saveAuthData consolidado ao invés de reimplementar
        saveAuthData({ token, user, expiresAt }, remember)

        set({ token, user })
    },

    logout: () => {
        removeAuthData()
        set({ token: null, user: null })
    },

    loadFromStorage: () => {
        const authData = loadAuthData()

        if (authData) {
            set({
                token: authData.token,
                user: authData.user as User
            })
        } else {
            set({ token: null, user: null })
        }
    },

    isAuthenticated: () => {
        const authData = loadAuthData()
        const isAuth = !!authData?.token
        return isAuth
    }
}))
