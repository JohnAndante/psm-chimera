export type UserRole = 'ADMIN' | 'USER'

export interface BaseUser {
    id: string
    email: string
    name: string
    role: UserRole
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateUserResponse {
    message: string
    user: BaseUser
}

export type ListUsersResponse = {
    message: string
    users: BaseUser[]
}
