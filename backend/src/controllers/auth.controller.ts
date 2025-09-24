import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { generateToken, AuthenticatedRequest } from '../utils/auth.js';
import { authService } from '../services/auth.service.js';

export class AuthController {

    // POST /api/v1/auth/login
    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }

        return authService.findUserByEmail(email)
            .then(async user => {
                if (!user || !user.auth) {
                    return res.status(401).json({
                        error: 'Credenciais inválidas'
                    });
                }

                // Verifica se usuário está ativo
                if (!user.auth.active) {
                    return res.status(401).json({
                        error: 'Usuário inativo'
                    });
                }

                // Verifica senha
                const isPasswordValid = await bcrypt.compare(password, user.auth.password_hash);

                if (!isPasswordValid) {
                    return res.status(401).json({
                        error: 'Credenciais inválidas'
                    });
                }

                // Gera token
                const token = generateToken({
                    id: user.id,
                    email: user.email,
                    role: user.role
                });

                // Remove dados sensíveis
                const { auth, ...userWithoutAuth } = user;

                res.status(200).json({
                    message: 'Login realizado com sucesso',
                    token,
                    user: userWithoutAuth
                });
            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // POST /api/v1/auth/logout
    static async logout(req: Request, res: Response) {
        // Com JWT stateless, logout é apenas cliente removendo o token
        res.json({
            message: 'Logout realizado com sucesso'
        });
    }

    // GET /api/v1/auth/me
    static async me(req: AuthenticatedRequest, res: Response) {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        // Busca dados atualizados do usuário
        return authService.findUserById(req.user.id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: 'Usuário não encontrado'
                    });
                }

                res.json({ user });
            })
            .catch(error => {
                console.error('Erro ao buscar usuário:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // POST /api/v1/auth/change-password
    static async changePassword(req: AuthenticatedRequest, res: Response) {
        const {
            current_password: currentPassword,
            new_password: newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        // Captura userId após validação para uso seguro dentro do callback
        const userId = req.user.id;

        // Busca dados de autenticação
        return authService.findAuthByUserId(userId)
            .then(async auth => {
                if (!auth) {
                    return res.status(404).json({
                        error: 'Dados de autenticação não encontrados'
                    });
                }

                // Verifica senha atual
                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, (auth as any).password_hash);

                if (!isCurrentPasswordValid) {
                    return res.status(401).json({
                        error: 'Senha atual incorreta'
                    });
                }

                // Gera hash da nova senha
                const saltRounds = 12;
                const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

                // Atualiza senha
                await authService.updateUserPassword(userId, newPasswordHash);

                res.json({
                    message: 'Senha alterada com sucesso'
                });
            })
            .catch(error => {
                console.error('Erro ao alterar senha:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

}
