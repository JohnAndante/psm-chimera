import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { userService } from '../services/user.service';
import { CreateUserData, UpdateUserData, ChangePasswordData } from '../types/user.type';
import { authService } from '../services/auth.service';

export class UserController {
    // GET /api/v1/users
    static getAll(req: AuthenticatedRequest, res: Response) {
        const filters = req.filters || {};
        const pagination = req.pagination || { limit: 10, offset: 0 };
        const sorting = req.sorting || { createdAt: 'desc' };

        return userService.getAllUsers(filters, pagination, sorting)
            .then(result => {
                const { data, total } = result;

                return res.status(200).json({
                    data,
                    pagination: {
                        limit: pagination.limit,
                        offset: pagination.offset,
                        total: total,
                    }
                });

            })
            .catch(error => {
                console.error('Erro ao buscar usuários:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar usuários'
                });
            });
    }

    // GET /api/v1/users/:id
    static getById(req: AuthenticatedRequest, res: Response) {
        const id = parseInt(req.params.id);

        return userService.getUserById(id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: 'Usuário não encontrado'
                    });
                }

                // Remover dados sensíveis da resposta
                const safeUser = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    active: user.active,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };

                res.status(200).json({
                    message: 'Usuário recuperado com sucesso',
                    user: safeUser
                });
            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar usuário'
                });
            });
    }

    // POST /api/v1/users
    static create(req: AuthenticatedRequest, res: Response) {
        const userData: CreateUserData = req.body;

        // Verificar se email já existe
        return userService.checkEmailExists(userData.email)
            .then(async emailExists => {
                if (emailExists) {
                    return res.status(409).json({
                        error: 'Já existe um usuário com esse email'
                    });
                }

                // Criar usuário
                const newUser = await userService.createUser(userData)
                // Remover dados sensíveis da resposta
                const safeUser = {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    active: newUser.active,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                };

                res.status(201).json({
                    message: 'Usuário criado com sucesso',
                    user: safeUser
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: 'Erro interno do servidor ao verificar email'
                });
            });
    }

    // PUT /api/v1/users/:id
    static update(req: AuthenticatedRequest, res: Response) {
        const id = parseInt(req.params.id);
        const updateData: UpdateUserData = req.body;

        // Verificar se usuário existe
        return userService.getUserById(id)
            .then(async existingUser => {
                if (!existingUser) {
                    return res.status(404).json({
                        error: 'Usuário não encontrado'
                    });
                }

                // Se está atualizando o email, verificar se já existe
                if (updateData.email && updateData.email !== existingUser.email) {
                    const emailExists = await userService.checkEmailExists(updateData.email, id)
                    if (emailExists) {
                        return res.status(409).json({
                            error: 'Já existe um usuário com esse email'
                        });
                    }

                    // Atualizar usuário
                    const updatedUser = await userService.updateUser(id, updateData)
                    // Remover dados sensíveis da resposta
                    const safeUser = {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        active: updatedUser.active,
                        createdAt: updatedUser.createdAt,
                        updatedAt: updatedUser.updatedAt
                    };

                    res.status(200).json({
                        message: 'Usuário atualizado com sucesso',
                        user: safeUser
                    });
                } else {
                    // Atualizar usuário sem verificar email
                    const updatedUser = await userService.updateUser(id, updateData)

                    // Remover dados sensíveis da resposta
                    const safeUser = {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        active: updatedUser.active,
                        createdAt: updatedUser.createdAt,
                        updatedAt: updatedUser.updatedAt
                    };

                    res.status(200).json({
                        message: 'Usuário atualizado com sucesso',
                        user: safeUser
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar usuário'
                });
            });
    }

    // DELETE /api/v1/users/:id
    static delete(req: AuthenticatedRequest, res: Response) {
        const id = parseInt(req.params.id);

        // Verificar se usuário existe
        return userService.getUserById(id)
            .then(async existingUser => {
                if (!existingUser) {
                    return res.status(404).json({
                        error: 'Usuário não encontrado'
                    });
                }

                // Impedir auto-delete
                if (req.user && req.user.id === id) {
                    return res.status(400).json({
                        error: 'Não é possível deletar seu próprio usuário'
                    });
                }

                // Deletar usuário (soft delete)
                await userService.deleteUser(id)
                res.status(200).json({
                    message: 'Usuário removido com sucesso'
                });
            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar usuário'
                });
            });
    }

    // PUT /api/v1/users/:id/change-password
    static changePassword(req: AuthenticatedRequest, res: Response) {
        const id = parseInt(req.params.id);
        const passwordData: ChangePasswordData = req.body;

        // Verificar se usuário existe
        return userService.getUserById(id)
            .then(async existingUser => {
                if (!existingUser) {
                    return res.status(404).json({
                        error: 'Usuário não encontrado'
                    });
                }

                const hashedPassword = authService.hashPassword(passwordData.password);

                // Alterar senha
                await authService.updateUserPassword(id, hashedPassword);
                res.status(200).json({
                    message: 'Senha alterada com sucesso'
                });

            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor ao buscar usuário'
                });
            });
    }
}
