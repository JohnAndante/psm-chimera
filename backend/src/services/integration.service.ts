import { db } from '../factory/database.factory';
import { IntegrationType } from "../types/database";
import { IntegrationLite } from '../types/integration.type';

class IntegrationService {

    async findAll(): Promise<IntegrationLite[]> {
        return new Promise((resolve, reject) => {
            db.selectFrom('integrations')
                .select([
                    'id',
                    'name',
                    'type',
                    'active',
                ])
                .where('deleted_at', 'is', null)
                .orderBy('created_at', 'desc')
                .execute()
                .then(rows => {
                    // Agrupar resultados por integração
                    const integrationsMap = new Map();

                    rows.forEach(row => {
                        if (!integrationsMap.has(row.id)) {
                            integrationsMap.set(row.id, {
                                id: row.id,
                                name: row.name,
                                type: row.type,
                                active: row.active,
                            });
                        }
                    });

                    resolve(Array.from(integrationsMap.values()));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async findById(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.selectFrom('integrations')
                .leftJoin('integration_keys', 'integrations.id', 'integration_keys.integration_id')
                .leftJoin('job_configurations', 'integrations.id', 'job_configurations.integration_id')
                .select([
                    'integrations.id',
                    'integrations.name',
                    'integrations.type',
                    'integrations.base_url',
                    'integrations.email',
                    'integrations.config',
                    'integrations.active',
                    'integrations.created_at',
                    'integrations.updated_at',
                    // Chaves de integração
                    'integration_keys.id as integration_key_id',
                    'integration_keys.expires_at as integration_key_expires_at',
                    'integration_keys.created_at as integration_key_created_at',
                    // Configurações de jobs
                    'job_configurations.id as job_config_id',
                    'job_configurations.name as job_config_name',
                    'job_configurations.active as job_config_active',
                    'job_configurations.cron_pattern as job_config_cron_pattern'
                ])
                .where('integrations.id', '=', id)
                .where('integrations.deleted_at', 'is', null)
                .execute()
                .then(rows => {
                    if (rows.length === 0) {
                        return resolve(null);
                    }

                    const firstRow = rows[0];
                    const integration = {
                        id: firstRow.id,
                        name: firstRow.name,
                        type: firstRow.type,
                        base_url: firstRow.base_url,
                        email: firstRow.email,
                        config: firstRow.config,
                        active: firstRow.active,
                        created_at: firstRow.created_at,
                        updated_at: firstRow.updated_at,
                        integrationKey: [] as any[],
                        job_configs: [] as any[]
                    };

                    rows.forEach(row => {
                        // Adicionar chave de integração se existir
                        if (row.integration_key_id && !integration.integrationKey.find(k => k.id === row.integration_key_id)) {
                            integration.integrationKey.push({
                                id: row.integration_key_id,
                                expires_at: row.integration_key_expires_at,
                                created_at: row.integration_key_created_at
                            });
                        }

                        // Adicionar configuração de job se existir
                        if (row.job_config_id && !integration.job_configs.find(j => j.id === row.job_config_id)) {
                            integration.job_configs.push({
                                id: row.job_config_id,
                                name: row.job_config_name,
                                active: row.job_config_active,
                                cron_pattern: row.job_config_cron_pattern
                            });
                        }
                    });

                    resolve(integration);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async findByName(name: string) {
        return new Promise((resolve, reject) => {
            if (!name) {
                return reject(new Error('Nome é obrigatório'));
            }

            db.selectFrom('integrations')
                .selectAll()
                .where('integrations.name', '=', name)
                .where('integrations.deleted_at', 'is', null)
                .executeTakeFirst()
                .then(integration => {
                    resolve(integration || null);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async create(data: {
        name: string;
        type: IntegrationType;
        base_url?: string;
        email?: string;
        password?: string;
        config?: any;
    }) {
        return new Promise((resolve, reject) => {
            if (!data.name || !data.type) {
                return reject(new Error('Nome e tipo são obrigatórios'));
            }

            db.insertInto('integrations')
                .values({
                    name: data.name,
                    type: data.type,
                    base_url: data.base_url || null,
                    email: data.email || null,
                    password: data.password || null,
                    config: data.config || null,
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null
                })
                .returning([
                    'id', 'name', 'type', 'base_url', 'email',
                    'config', 'active', 'created_at', 'updated_at'
                ])
                .executeTakeFirst()
                .then(integration => {
                    resolve({
                        ...integration,
                        integrationKey: []
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async update(id: number, data: {
        name?: string;
        type?: IntegrationType;
        base_url?: string;
        email?: string;
        password?: string;
        config?: any;
        active?: boolean;
    }) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            const updateData: any = {
                updated_at: new Date()
            };

            if (data.name !== undefined) updateData.name = data.name;
            if (data.type !== undefined) updateData.type = data.type;
            if (data.base_url !== undefined) updateData.base_url = data.base_url;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.password !== undefined) updateData.password = data.password;
            if (data.config !== undefined) updateData.config = data.config;
            if (data.active !== undefined) updateData.active = data.active;

            db.updateTable('integrations')
                .set(updateData)
                .where('id', '=', id)
                .returning([
                    'id', 'name', 'type', 'base_url', 'email',
                    'config', 'active', 'created_at', 'updated_at'
                ])
                .executeTakeFirst()
                .then(integration => {
                    resolve({
                        ...integration,
                        integrationKey: []
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async softDelete(id: number) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID é obrigatório'));
            }

            db.updateTable('integrations')
                .set({
                    deleted_at: new Date(),
                    active: false,
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .execute()
                .then(() => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async checkNameConflict(name: string, excludeId?: number) {
        return new Promise((resolve, reject) => {
            if (!name) {
                return reject(new Error('Nome é obrigatório'));
            }

            let query = db.selectFrom('integrations')
                .selectAll()
                .where('integrations.name', '=', name)
                .where('integrations.deleted_at', 'is', null);

            if (excludeId) {
                query = query.where('integrations.id', '!=', excludeId);
            }

            query.executeTakeFirst()
                .then(integration => {
                    resolve(integration || null);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async testConnection(integration: any) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!integration.active) {
                    return reject(new Error('Integração está inativa'));
                }

                let testResult;

                switch (integration.type) {
                    case 'RP': {
                        const { RPIntegrationService } = await import('./rp.integration.service.js');
                        const rpService = new RPIntegrationService(integration.config);
                        testResult = await rpService.testConnection();
                        break;
                    }

                    case 'CRESCEVENDAS': {
                        const { CresceVendasIntegrationService } = await import('./crescevendas.integration.service.js');
                        const cvService = new CresceVendasIntegrationService(integration.config);
                        testResult = await cvService.testConnection();
                        break;
                    }

                    case 'TELEGRAM':
                        testResult = {
                            success: true,
                            message: 'Teste de integração Telegram não implementado ainda',
                            data: {
                                bot_token: 'Configurado',
                                status: 'Ativo'
                            }
                        };
                        break;

                    case 'EMAIL':
                        const emailConfig = integration.config as any;
                        testResult = {
                            success: true,
                            message: 'Teste de integração Email não implementado ainda',
                            data: {
                                smtp_host: emailConfig?.smtp_host || 'Não configurado',
                                status: 'Configurado'
                            }
                        };
                        break;

                    default:
                        testResult = {
                            success: false,
                            message: 'Tipo de integração não suportado para teste',
                            error: `Tipo '${integration.type}' não reconhecido`
                        };
                }

                resolve(testResult);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export const integrationService = new IntegrationService();
