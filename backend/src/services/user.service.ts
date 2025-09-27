import { db } from '../factory/database.factory';
import bcrypt from 'bcryptjs';
import {
    UserData,
    CreateUserData,
    UpdateUserData,
    UserFilters,
    UserWithAuth,
    ChangePasswordData
} from '../types/user.type';
import { AuthTable, UserTable } from '../types/database';

class UserService {

    getAllUsers(filters: UserFilters = {}): Promise<UserWithAuth[]> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('users')
                .leftJoin('authentications', 'users.id', 'authentications.user_id')
                .select([
                    'users.id',
                    'users.email',
                    'users.name',
                    'users.role',
                    'users.createdAt',
                    'users.updatedAt',
                    'users.deletedAt',
                    'authentications.id as auth_id',
                    'authentications.email as auth_email',
                    'authentications.active as auth_active',
                    'authentications.created_at as auth_created_at',
                    'authentications.updated_at as auth_updated_at'
                ])
                .where('users.deletedAt', 'is', null);

            // Filtro por role
            if (filters.role) {
                query = query.where('users.role', '=', filters.role);
            }

            // Filtro por status ativo (através da auth)
            if (filters.active !== undefined) {
                query = query.where('authentications.active', '=', filters.active);
            }

            // Busca por nome ou email
            if (filters.search) {
                const searchTerm = `%${filters.search}%`;
                query = query.where((eb) =>
                    eb.or([
                        eb('users.name', 'ilike', searchTerm),
                        eb('users.email', 'ilike', searchTerm)
                    ])
                );
            }

            query
                .orderBy('users.createdAt', 'desc')
                .execute()
                .then((rows: any[]) => {
                    const users: UserWithAuth[] = rows.map(row => ({
                        id: row.id,
                        email: row.email,
                        name: row.name,
                        role: row.role,
                        active: row.auth_active || false,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt,
                        deletedAt: row.deletedAt,
                        auth: row.auth_id ? {
                            id: row.auth_id,
                            email: row.auth_email,
                            active: row.auth_active,
                            created_at: row.auth_created_at,
                            updated_at: row.auth_updated_at
                        } : null
                    }));
                    resolve(users);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    getUserById(id: number): Promise<UserWithAuth | null> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.selectFrom('users')
                .leftJoin('authentications', 'users.id', 'authentications.user_id')
                .select([
                    'users.id',
                    'users.email',
                    'users.name',
                    'users.role',
                    'users.createdAt',
                    'users.updatedAt',
                    'users.deletedAt',
                    'authentications.id as auth_id',
                    'authentications.email as auth_email',
                    'authentications.active as auth_active',
                    'authentications.created_at as auth_created_at',
                    'authentications.updated_at as auth_updated_at'
                ])
                .where('users.id', '=', id)
                .where('users.deletedAt', 'is', null)
                .executeTakeFirst()
                .then((row: any) => {
                    if (!row) {
                        resolve(null);
                        return;
                    }

                    const user: UserWithAuth = {
                        id: row.id,
                        email: row.email,
                        name: row.name,
                        role: row.role,
                        active: row.auth_active || false,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt,
                        deletedAt: row.deletedAt,
                        auth: row.auth_id ? {
                            id: row.auth_id,
                            email: row.auth_email,
                            active: row.auth_active,
                            created_at: row.auth_created_at,
                            updated_at: row.auth_updated_at
                        } : null
                    };
                    resolve(user);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    getUserByEmail(email: string): Promise<UserWithAuth | null> {
        return new Promise((resolve, reject) => {
            if (!email) {
                return reject(new Error('Email é obrigatório'));
            }

            db.selectFrom('users')
                .leftJoin('authentications', 'users.id', 'authentications.user_id')
                .select([
                    'users.id',
                    'users.email',
                    'users.name',
                    'users.role',
                    'users.createdAt',
                    'users.updatedAt',
                    'users.deletedAt',
                    'authentications.id as auth_id',
                    'authentications.email as auth_email',
                    'authentications.active as auth_active',
                    'authentications.password_hash',
                    'authentications.created_at as auth_created_at',
                    'authentications.updated_at as auth_updated_at'
                ])
                .where('users.email', '=', email)
                .where('users.deletedAt', 'is', null)
                .executeTakeFirst()
                .then((row: any) => {
                    if (!row) {
                        resolve(null);
                        return;
                    }

                    const user: UserWithAuth = {
                        id: row.id,
                        email: row.email,
                        name: row.name,
                        role: row.role,
                        active: row.auth_active || false,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt,
                        deletedAt: row.deletedAt,
                        auth: row.auth_id ? {
                            id: row.auth_id,
                            email: row.auth_email,
                            active: row.auth_active,
                            created_at: row.auth_created_at,
                            updated_at: row.auth_updated_at
                        } : null
                    };
                    resolve(user);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('users')
                .select('id')
                .where('email', '=', email)
                .where('deletedAt', 'is', null);

            if (excludeId) {
                query = query.where('id', '!=', excludeId);
            }

            query
                .executeTakeFirst()
                .then(result => {
                    if (result) {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                })
                .catch(reject);
        });
    }

    createUser(data: CreateUserData): Promise<UserWithAuth> {
        return new Promise((resolve, reject) => {
            const now = new Date();

            // Hash da senha
            bcrypt.hash(data.password, 10)
                .then((passwordHash: string) => {
                    // Iniciar transação
                    db.transaction()
                        .execute(async (trx) => {
                            // Criar usuário
                            const userData = {
                                email: data.email,
                                name: data.name || null,
                                role: data.role || 'USER',
                                createdAt: now,
                                updatedAt: now
                            };

                            const newUser = await trx
                                .insertInto('users')
                                .values(userData)
                                .returningAll()
                                .executeTakeFirstOrThrow();

                            // Criar autenticação
                            const authData = {
                                user_id: newUser.id!,
                                email: data.email,
                                password_hash: passwordHash,
                                active: data.active !== undefined ? data.active : true,
                                created_at: now,
                                updated_at: now
                            };

                            const newAuth = await trx
                                .insertInto('authentications')
                                .values(authData)
                                .returningAll()
                                .executeTakeFirstOrThrow();

                            return { user: newUser, auth: newAuth };
                        })
                        .then(({ user, auth }) => {
                            const result: UserWithAuth = {
                                id: user.id!,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                                active: auth.active,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt,
                                deletedAt: user.deletedAt,
                                auth: {
                                    id: auth.id!,
                                    email: auth.email,
                                    active: auth.active,
                                    created_at: auth.created_at,
                                    updated_at: auth.updated_at
                                }
                            };
                            resolve(result);
                        })
                        .catch(error => {
                            reject(error);
                        });
                })
                .catch(error => {
                    reject(new Error('Erro ao processar senha'));
                });
        });
    }

    updateUser(id: number, data: UpdateUserData): Promise<UserWithAuth> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            const now = new Date();

            // Se há senha para atualizar, fazer hash
            db.transaction()
                .execute(async (trx) => {
                    // Atualizar dados do usuário
                    const userData: Partial<UserTable> = {
                        updatedAt: now
                    };

                    if (data.email !== undefined) userData.email = data.email;
                    if (data.name !== undefined) userData.name = data.name;
                    if (data.role !== undefined) userData.role = data.role;

                    const updatedUser = await trx
                        .updateTable('users')
                        .set(userData)
                        .where('id', '=', id)
                        .where('deletedAt', 'is', null)
                        .returningAll()
                        .executeTakeFirstOrThrow();

                    // Atualizar autenticação se necessário
                    let updatedAuth = null;
                    const authData: Partial<AuthTable> = {
                        updated_at: now
                    };

                    if (data.email !== undefined) authData.email = data.email;
                    if (data.active !== undefined) authData.active = data.active;

                    // Verificar se há algum campo de auth para atualizar
                    if (Object.keys(authData).length > 1) {
                        updatedAuth = await trx
                            .updateTable('authentications')
                            .set(authData)
                            .where('user_id', '=', id)
                            .where('deleted_at', 'is', null)
                            .returningAll()
                            .executeTakeFirst();
                    } else {
                        // Buscar auth existente
                        updatedAuth = await trx
                            .selectFrom('authentications')
                            .selectAll()
                            .where('user_id', '=', id)
                            .where('deleted_at', 'is', null)
                            .executeTakeFirst();
                    }

                    return { user: updatedUser, auth: updatedAuth };
                })
                .then(({ user, auth }) => {
                    const result: UserWithAuth = {
                        id: user.id!,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        active: auth?.active || false,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        deletedAt: user.deletedAt,
                        auth: auth ? {
                            id: auth.id!,
                            email: auth.email,
                            active: auth.active,
                            created_at: auth.created_at,
                            updated_at: auth.updated_at
                        } : null
                    };
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    deleteUser(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            const now = new Date();

            db.transaction()
                .execute(async (trx) => {
                    // Soft delete do usuário
                    await trx
                        .updateTable('users')
                        .set({
                            deletedAt: now,
                            updatedAt: now
                        })
                        .where('id', '=', id)
                        .where('deletedAt', 'is', null)
                        .executeTakeFirstOrThrow();

                    // Soft delete da autenticação
                    await trx
                        .updateTable('authentications')
                        .set({
                            deleted_at: now,
                            updated_at: now,
                            active: false
                        })
                        .where('user_id', '=', id)
                        .where('deleted_at', 'is', null)
                        .execute();
                })
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

export const userService = new UserService();
