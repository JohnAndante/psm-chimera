import { Response } from 'express';
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
        const { name, type, config } = req.body;

        if (!name || !type || !config) {
            return res.status(400).json({
                error: 'Nome, tipo e configuração são obrigatórios'
            });
        }

        // Verificar se o tipo é válido (apenas RP e CresceVendas)
        const validTypes = ['RP', 'CRESCEVENDAS'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Tipo de integração deve ser RP ou CRESCEVENDAS'
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
        const { name, type, config, active } = req.body;

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

    // POST /api/v1/integrations/validate-config
    static async validateConfig(req: AuthenticatedRequest, res: Response) {
        const { type, config } = req.body;

        if (!type || !config) {
            return res.status(400).json({
                error: 'Tipo e configuração são obrigatórios'
            });
        }

        const validTypes = ['RP', 'CRESCEVENDAS', 'TELEGRAM', 'EMAIL', 'WEBHOOK'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Tipo de integração inválido'
            });
        }

        const validateConfigByType = () => {
            switch (type) {
                case 'RP':
                    return import('../services/rp.integration.service.js')
                        .then(({ RPIntegrationService }) => RPIntegrationService.validateConfig(config));

                case 'CRESCEVENDAS':
                    return import('../services/crescevendas.integration.service.js')
                        .then(({ CresceVendasIntegrationService }) => CresceVendasIntegrationService.validateConfig(config));

                default:
                    return Promise.resolve({
                        valid: false,
                        errors: [`Validação para tipo '${type}' não implementada ainda`]
                    });
            }
        };

        return validateConfigByType()
            .then((validationResult) => {
                if (validationResult.valid) {
                    return res.json({
                        message: 'Configuração válida',
                        valid: true
                    });
                } else {
                    return res.status(400).json({
                        message: 'Configuração inválida',
                        valid: false,
                        errors: validationResult.errors
                    });
                }
            })
            .catch((error) => {
                console.error('Erro ao validar configuração:', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/integrations/:id/status
    static async getStatus(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        return integrationService.findById(parseInt(id))
            .then(async integration => {
                if (!integration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                return integrationService.testConnection(integration)
                    .then((testResult: any) => {
                        return res.json({
                            integration_id: integration.id,
                            name: integration.name,
                            type: integration.type,
                            active: integration.active,
                            connection_status: testResult?.success ? 'connected' : 'disconnected',
                            last_test: new Date().toISOString(),
                            test_result: testResult
                        });
                    })
                    .catch((error) => {
                        return res.json({
                            integration_id: integration.id,
                            name: integration.name,
                            type: integration.type,
                            active: integration.active,
                            connection_status: 'error',
                            last_test: new Date().toISOString(),
                            error: error instanceof Error ? error.message : 'Erro desconhecido'
                        });
                    });
            })
            .catch(error => {
                console.error('Erro ao verificar status da integração:', error);
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }

    // GET /api/v1/integrations/types
    static async getIntegrationTypes(req: AuthenticatedRequest, res: Response) {
        const types = [
            {
                value: 'RP',
                label: 'RP Sistema de Retaguarda',
                description: 'Integração com o sistema RP para buscar produtos com desconto',
                configuration_fields: [
                    { name: 'auth_method', type: 'select', options: ['TOKEN', 'LOGIN'], required: true },
                    { name: 'base_url', type: 'url', required: true },
                    { name: 'username', type: 'text', required: false },
                    { name: 'password', type: 'password', required: false },
                    { name: 'static_token', type: 'text', required: false },
                    { name: 'products_endpoint', type: 'text', required: true }
                ]
            },
            {
                value: 'CRESCEVENDAS',
                label: 'CresceVendas API',
                description: 'Integração com CresceVendas para enviar campanhas de desconto',
                configuration_fields: [
                    { name: 'base_url', type: 'url', required: true },
                    { name: 'auth_headers', type: 'object', required: true },
                    { name: 'send_products_endpoint', type: 'text', required: false },
                    { name: 'get_products_endpoint', type: 'text', required: false }
                ]
            }
        ];

        res.json({
            message: 'Tipos de integração disponíveis',
            types
        });
    }

    // POST /api/v1/integrations/:id/toggle
    static async toggle(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;

        return integrationService.findById(parseInt(id))
            .then(integration => {
                if (!integration) {
                    return res.status(404).json({
                        error: 'Integração não encontrada'
                    });
                }

                const newStatus = !integration.active;

                // If activating, test connection first
                if (newStatus) {
                    return integrationService.testConnection(integration)
                        .then((testResult: any) => {
                            if (!testResult?.success) {
                                return res.status(400).json({
                                    error: 'Não é possível ativar integração: falha no teste de conexão',
                                    test_result: testResult
                                });
                            }
                            // Test passed, proceed with activation
                            return integrationService.update(parseInt(id), { active: newStatus })
                                .then(updatedIntegration => {
                                    return res.json({
                                        message: `Integração ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
                                        integration: updatedIntegration
                                    });
                                });
                        })
                        .catch((error) => {
                            return res.status(400).json({
                                error: 'Não é possível ativar integração: erro no teste de conexão',
                                details: error instanceof Error ? error.message : 'Erro desconhecido'
                            });
                        });
                } else {
                    // Deactivating, no need to test
                    return integrationService.update(parseInt(id), { active: newStatus })
                        .then(updatedIntegration => {
                            return res.json({
                                message: `Integração ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
                                integration: updatedIntegration
                            });
                        });
                }
            })
            .catch(error => {
                console.error('Erro ao alterar status da integração:', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            });
    }
}
