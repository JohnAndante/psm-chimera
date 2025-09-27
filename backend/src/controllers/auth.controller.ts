import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { authService } from '../services/auth.service';

export class AuthController {

    // POST /api/v1/auth/login
    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email e senha são obrigatórios'
            });
        }

        return authService.authenticateUser(email, password)
            .then(loginData => {
                if (!loginData) {
                    return res.status(401).json({
                        error: 'Credenciais inválidas'
                    });
                }

                const { token, user } = loginData;

                res.status(200).json({
                    message: 'Login realizado com sucesso',
                    token,
                    user,
                });
            })
            .catch(error => {
                res.status(401).json({
                    error: error.message || 'Erro ao autenticar usuário'
                });
            });
    }

    // POST /api/v1/auth/logout
    static async logout(_req: Request, res: Response) {
        res.json({
            message: 'Logout realizado com sucesso'
        });
    }

    // POST /api/v1/auth/refresh
    static async refresh(req: Request, res: Response) {
        const authHeader = req.headers['authorization'];
        const refreshToken = authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : req.body.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Token de atualização é obrigatório'
            });
        }

        return authService.refreshAuthToken(refreshToken)
            .then(newToken => {
                if (!newToken) {
                    return res.status(401).json({
                        error: 'Token de atualização inválido ou expirado'
                    });
                }

                res.json({
                    message: 'Token atualizado com sucesso',
                    token: newToken
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: error.message || 'Erro ao atualizar token'
                });
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
                const isCurrentPasswordValid = authService.isPasswordValid(currentPassword, (auth as any).password_hash);

                if (!isCurrentPasswordValid) {
                    return res.status(401).json({
                        error: 'Senha atual incorreta'
                    });
                }

                // Gera hash da nova senha
                const newPasswordHash = authService.hashPassword(newPassword);


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
