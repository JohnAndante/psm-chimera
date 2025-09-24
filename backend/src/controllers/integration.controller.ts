import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/auth';
import { integrationService } from '../services/integration.service';

export class IntegrationController {

    // GET /api/v1/integrations
    static async getAll(req: AuthenticatedRequest, res: Response) {
        return integrationService.findAll()
            .then(integrations => {
                res.status(200).json({
                    message: 'Integrações recuperadas com sucesso',
                    integrations
                });
            })
            .catch(error => {
                console.error('Erro ao buscar integrações:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/integrations/:id
    static async getById(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        return integrationService.findById(parseInt(id))
            .then(integration => {
                if (!integration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                res.json({
                    message: 'Integração recuperada com sucesso',
                    integration
                });
            })
            .catch(error => {
                console.error('Erro ao buscar integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // POST /api/v1/integrations
    static async create(req: AuthenticatedRequest, res: Response) {
        const { name, type, base_url, email, password, config } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                error: 'Nome e tipo são obrigatórios'
            });
        }

        // Verificar se o tipo é válido
        const validTypes = ['RP', 'CRESCEVENDAS', 'TELEGRAM', 'EMAIL', 'WEBHOOK'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Tipo de integração inválido'
            });
        }

        // Verifica se já existe integração com o mesmo nome
        return integrationService.findByName(name)
            .then(async existingIntegration => {
                if (existingIntegration) {
                    return res.status(409).json({
                        error: 'Já existe uma integração com este nome'
                    });
                }

                return integrationService.create({
                    name,
                    type,
                    base_url,
                    email,
                    password,
                    config
                })
                    .then(integration => {
                        res.status(201).json({
                            message: 'Integração criada com sucesso',
                            integration
                        });
                    });
            })
            .catch(error => {
                console.error('Erro ao criar integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // PUT /api/v1/integrations/:id
    static async update(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const { name, type, base_url, email, password, config, active } = req.body;

        // Verifica se integração existe
        return integrationService.findById(parseInt(id))
            .then(async existingIntegration => {
                if (!existingIntegration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                // Verifica conflito de nome (se mudou o nome)
                if (name && name !== (existingIntegration as any).name) {
                    return integrationService.checkNameConflict(name, parseInt(id))
                        .then(async nameConflict => {
                            if (nameConflict) {
                                return res.status(409).json({
                                    error: 'Já existe uma integração com este nome'
                                });
                            }

                            return integrationService.update(parseInt(id), {
                                name,
                                type,
                                base_url,
                                email,
                                password,
                                config,
                                active
                            })
                                .then(integration => {
                                    res.json({
                                        message: 'Integração atualizada com sucesso',
                                        integration
                                    });
                                });
                        });
                } else {
                    return integrationService.update(parseInt(id), {
                        name,
                        type,
                        base_url,
                        email,
                        password,
                        config,
                        active
                    })
                        .then(integration => {
                            res.json({
                                message: 'Integração atualizada com sucesso',
                                integration
                            });
                        });
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // DELETE /api/v1/integrations/:id
    static async delete(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        // Verifica se integração existe
        return integrationService.findById(parseInt(id))
            .then(async existingIntegration => {
                if (!existingIntegration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                // Soft delete
                return integrationService.softDelete(parseInt(id))
                    .then(() => {
                        res.json({
                            message: 'Integração excluída com sucesso'
                        });
                    });
            })
            .catch(error => {
                console.error('Erro ao excluir integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // POST /api/v1/integrations/:id/test
    static async testConnection(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        return integrationService.findById(parseInt(id))
            .then(async integration => {
                if (!integration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                return integrationService.testConnection(integration)
                    .then(testResult => {
                        res.json(testResult);
                    });
            })
            .catch(error => {
                console.error('Erro ao testar integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }
}
