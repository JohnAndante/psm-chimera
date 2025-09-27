import { UserType, UserTable, AuthTable } from './database';

// Dados completos do usuário com autenticação
export interface UserData {
    id: number;
    email: string;
    name: string | null;
    role: UserType;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// Dados para criação de usuário
export interface CreateUserData {
    email: string;
    name?: string;
    role?: UserType;
    password: string;
    active?: boolean;
}

// Dados para atualização de usuário
export interface UpdateUserData {
    email?: string;
    name?: string;
    role?: UserType;
    active?: boolean;
}

// Filtros para busca de usuários
export interface UserFilters {
    role?: UserType;
    active?: boolean;
    search?: string; // Busca por nome ou email
}

// Usuário com dados de autenticação (para responses completas)
export interface UserWithAuth extends UserData {
    auth: {
        id: number;
        email: string;
        active: boolean;
        created_at: Date;
        updated_at: Date;
    } | null;
}

// Response de login/criação (sem dados sensíveis)
export interface UserResponse {
    id: number;
    email: string;
    name: string | null;
    role: UserType;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Dados para mudança de senha
export interface ChangePasswordData {
    password: string;
}
