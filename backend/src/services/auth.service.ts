import bcrypt from 'bcryptjs';
import { db } from '../factory/database.factory';
import { AuthenticatedUser, UserAuthData } from '../types/auth.type';
import { extractPayload, generateToken } from '../utils/auth';

class AuthService {

    async findUserByEmail(email: string): Promise<UserAuthData | null> {
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
                    'authentications.id as auth_id',
                    'authentications.email as auth_email',
                    'authentications.password_hash as auth_password_hash',
                    'authentications.active as auth_active',
                    'authentications.created_at as auth_created_at',
                    'authentications.updated_at as auth_updated_at'
                ])
                .where('users.email', '=', email)
                .where('users.deletedAt', 'is', null)
                .executeTakeFirst()
                .then(row => {
                    if (!row) {
                        return resolve(null);
                    }

                    if (!row.auth_id) {
                        reject(new Error('Authentication record not found for user'));
                        return;
                    }

                    const user = {
                        id: row.id,
                        email: row.email,
                        name: row.name,
                        role: row.role,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt,
                        auth: {
                            id: row.auth_id,
                            user_id: row.id,
                            email: row.auth_email,
                            password_hash: row.auth_password_hash,
                            active: row.auth_active,
                            created_at: row.auth_created_at,
                            updated_at: row.auth_updated_at
                        }
                    } as UserAuthData;

                    resolve(user);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async authenticateUser(email: string, password: string): Promise<AuthenticatedUser> {
        return this.findUserByEmail(email)
            .then(async user => {
                if (!user || !user.auth) {
                    throw new Error('Credenciais inválidas');
                }

                // Verifica se usuário está ativo
                if (!user.auth.active) {
                    throw new Error('Usuário inativo');
                }

                // Verifica senha
                const isPasswordValid = await bcrypt.compare(password, user.auth.password_hash);

                if (!isPasswordValid) {
                    throw new Error('Credenciais inválidas');
                }

                // Gera token
                const token = generateToken(user);

                // Remove dados sensíveis
                const { auth, ...userWithoutAuth } = user;

                return { token, user: userWithoutAuth };
            })
            .catch(err => {
                throw err;
            });
    }

    async findUserById(id: number) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.selectFrom('users')
                .select([
                    'id',
                    'email',
                    'name',
                    'role',
                    'createdAt',
                    'updatedAt'
                ])
                .where('id', '=', id)
                .where('deletedAt', 'is', null)
                .executeTakeFirst()
                .then(user => {
                    resolve(user || null);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async findAuthByUserId(userId: number) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject(new Error('User ID é obrigatório'));
            }

            db.selectFrom('authentications')
                .selectAll()
                .where('user_id', '=', userId)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then(auth => {
                    resolve(auth || null);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async updateUserPassword(userId: number, newPasswordHash: string) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                return reject(new Error('User ID é obrigatório'));
            }

            if (!newPasswordHash) {
                return reject(new Error('Novo hash de senha é obrigatório'));
            }

            db.updateTable('authentications')
                .set({
                    password_hash: newPasswordHash,
                    updated_at: new Date()
                })
                .where('user_id', '=', userId)
                .execute()
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async refreshAuthToken(refreshToken: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (!refreshToken) {
                return reject(new Error('Token de atualização é obrigatório'));
            }

            // Verifica se o token de atualização é válido
            const tokenPayload = extractPayload(refreshToken);

            if (!tokenPayload) {
                return reject(new Error('Token de atualização inválido ou expirado'));
            }

            // Verificar se faz mais de 4 horas que o token foi emitido
            const currentTime = Math.floor(Date.now() / 1000);
            const tokenAge = currentTime - tokenPayload.iat;

            if (tokenAge > 4 * 60 * 60) { // 4 horas em segundos
                return reject(new Error('Token de atualização expirado. Faça login novamente.'));
            }

            // Extrai o id do usuário do payload
            const userId = tokenPayload.id;

            if (!userId) {
                return reject(new Error('Token de atualização inválido'));
            }

            // Busca o usuário no banco de dados
            this.findUserById(userId)
                .then(user => {
                    if (!user) {
                        return reject(new Error('Usuário não encontrado'));
                    }

                    // Gera um novo token de acesso
                    const newAccessToken = generateToken(user as UserAuthData);
                    resolve(newAccessToken);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    isPasswordValid(password: string, hashedPassword: string): boolean {
        return bcrypt.compareSync(password, hashedPassword);
    }

    hashPassword(password: string): string {
        if (!password) {
            throw new Error('Password is required for hashing');
        }

        const saltRounds = 12;
        const salt = bcrypt.genSaltSync(saltRounds);
        return bcrypt.hashSync(password, salt);
    }
}

export const authService = new AuthService();
