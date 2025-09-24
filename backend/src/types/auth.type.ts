export interface UserAuthData {
    id: number;
    email: string;
    name: string;
    role: any; // mantemos 'any' aqui para não acoplar a enum externa; pode ser trocado para UserType
    createdAt: Date;
    updatedAt: Date;
    auth: {
        id: number;
        user_id: number;
        email: string;
        password_hash: string;
        active: boolean;
        created_at: Date;
        updated_at: Date;
    }
}

export interface AuthenticatedUser {
    token: string;
    user: Omit<UserAuthData, 'auth'>;
}
