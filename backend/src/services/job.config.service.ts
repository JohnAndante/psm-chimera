import { db } from '../factory/database.factory';
import { 
    JobConfigurationData, 
    CreateJobConfigurationData, 
    UpdateJobConfigurationData,
    JobConfigurationFilters,
    JobWithIntegration,
    JobWithExecutions,
    ExecutionResult,
    JobType,
    ExecutionStatus
} from '../types/job.type';

export class JobConfigurationService {

    static getAllJobs(filters: JobConfigurationFilters = {}): Promise<JobWithIntegration[]> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('job_configurations')
                .leftJoin('integrations', 'job_configurations.integration_id', 'integrations.id')
                .select([
                    'job_configurations.id',
                    'job_configurations.name',
                    'job_configurations.description',
                    'job_configurations.cron_pattern',
                    'job_configurations.job_type',
                    'job_configurations.config',
                    'job_configurations.active',
                    'job_configurations.integration_id',
                    'job_configurations.created_at',
                    'job_configurations.updated_at',
                    'job_configurations.deleted_at',
                    'integrations.id as integration_id',
                    'integrations.name as integration_name',
                    'integrations.type as integration_type'
                ])
                .where('job_configurations.deleted_at', 'is', null);

            // Filtro por status ativo
            if (filters.active !== undefined) {
                query = query.where('job_configurations.active', '=', filters.active);
            }

            // Filtro por tipo de job
            if (filters.job_type) {
                query = query.where('job_configurations.job_type', '=', filters.job_type);
            }

            // Filtro por integração
            if (filters.integration_id) {
                query = query.where('job_configurations.integration_id', '=', filters.integration_id);
            }

            // Busca por nome ou descrição
            if (filters.search) {
                const searchTerm = `%${filters.search}%`;
                query = query.where((eb: any) =>
                    eb.or([
                        eb('job_configurations.name', 'ilike', searchTerm),
                        eb('job_configurations.description', 'ilike', searchTerm)
                    ])
                );
            }

            query
                .orderBy('job_configurations.created_at', 'desc')
                .execute()
                .then((rows: any[]) => {
                    const jobs = rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        cron_pattern: row.cron_pattern,
                        job_type: row.job_type,
                        config: row.config,
                        active: row.active,
                        integration_id: row.integration_id,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        deleted_at: row.deleted_at,
                        integration: row.integration_id ? {
                            id: row.integration_id,
                            name: row.integration_name,
                            type: row.integration_type
                        } : undefined
                    }));
                    resolve(jobs);
                })
                .catch(reject);
        });
    }

    static getJobById(id: number): Promise<JobWithExecutions | null> {
        return new Promise((resolve, reject) => {
            // Buscar job configuration com integração
            const jobQuery = db
                .selectFrom('job_configurations')
                .leftJoin('integrations', 'job_configurations.integration_id', 'integrations.id')
                .select([
                    'job_configurations.id',
                    'job_configurations.name',
                    'job_configurations.description',
                    'job_configurations.cron_pattern',
                    'job_configurations.job_type',
                    'job_configurations.config',
                    'job_configurations.active',
                    'job_configurations.integration_id',
                    'job_configurations.created_at',
                    'job_configurations.updated_at',
                    'job_configurations.deleted_at',
                    'integrations.id as integration_id',
                    'integrations.name as integration_name',
                    'integrations.type as integration_type',
                    'integrations.config as integration_config'
                ])
                .where('job_configurations.id', '=', id)
                .where('job_configurations.deleted_at', 'is', null)
                .executeTakeFirst();

            // Buscar últimas execuções
            const executionsQuery = db
                .selectFrom('job_executions')
                .selectAll()
                .where('job_config_id', '=', id)
                .orderBy('started_at', 'desc')
                .limit(10)
                .execute();

            Promise.all([jobQuery, executionsQuery])
                .then(([job, executions]: [any, any[]]) => {
                    if (!job) {
                        resolve(null);
                        return;
                    }

                    const result: JobWithExecutions = {
                        id: job.id,
                        name: job.name,
                        description: job.description,
                        cron_pattern: job.cron_pattern,
                        job_type: job.job_type,
                        config: job.config,
                        active: job.active,
                        integration_id: job.integration_id,
                        created_at: job.created_at,
                        updated_at: job.updated_at,
                        deleted_at: job.deleted_at,
                        integration: job.integration_id ? {
                            id: job.integration_id,
                            name: job.integration_name,
                            type: job.integration_type,
                            config: job.integration_config
                        } : undefined,
                        executions
                    };

                    resolve(result);
                })
                .catch(reject);
        });
    }

    static createJob(data: CreateJobConfigurationData): Promise<JobWithIntegration> {
        return new Promise((resolve, reject) => {
            const jobData = {
                name: data.name,
                description: data.description || null,
                cron_pattern: data.cron_pattern,
                job_type: data.job_type,
                config: data.config || {},
                active: data.active !== undefined ? data.active : true,
                integration_id: data.integration_id || null,
                created_at: new Date(),
                updated_at: new Date()
            };

            db
                .insertInto('job_configurations')
                .values(jobData as any)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then((newJob: any) => {
                    // Se tem integration_id, buscar dados da integração
                    if (newJob.integration_id) {
                        db
                            .selectFrom('integrations')
                            .select(['id', 'name', 'type'])
                            .where('id', '=', newJob.integration_id)
                            .where('deleted_at', 'is', null)
                            .executeTakeFirst()
                            .then((integration: any) => {
                                resolve({
                                    ...newJob,
                                    integration
                                });
                            })
                            .catch(reject);
                    } else {
                        resolve(newJob);
                    }
                })
                .catch(reject);
        });
    }

    static checkNameExists(name: string, excludeId?: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('job_configurations')
                .select('id')
                .where('name', '=', name)
                .where('deleted_at', 'is', null);

            if (excludeId !== undefined) {
                query = query.where('id', '!=', excludeId);
            }

            query
                .executeTakeFirst()
                .then((result: any) => resolve(!!result))
                .catch(reject);
        });
    }

    static checkIntegrationExists(integrationId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('integrations')
                .select('id')
                .where('id', '=', integrationId)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((result: any) => resolve(!!result))
                .catch(reject);
        });
    }

    static updateJob(id: number, data: UpdateJobConfigurationData): Promise<JobWithIntegration> {
        return new Promise((resolve, reject) => {
            const updateData: any = {
                updated_at: new Date()
            };

            if (data.name !== undefined) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.cron_pattern !== undefined) updateData.cron_pattern = data.cron_pattern;
            if (data.job_type !== undefined) updateData.job_type = data.job_type;
            if (data.config !== undefined) updateData.config = data.config;
            if (data.active !== undefined) updateData.active = data.active;
            if (data.integration_id !== undefined) updateData.integration_id = data.integration_id;

            db
                .updateTable('job_configurations')
                .set(updateData)
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .returningAll()
                .executeTakeFirstOrThrow()
                .then((updatedJob: any) => {
                    // Se tem integration_id, buscar dados da integração
                    if (updatedJob.integration_id) {
                        db
                            .selectFrom('integrations')
                            .select(['id', 'name', 'type'])
                            .where('id', '=', updatedJob.integration_id)
                            .where('deleted_at', 'is', null)
                            .executeTakeFirst()
                            .then((integration: any) => {
                                resolve({
                                    ...updatedJob,
                                    integration
                                });
                            })
                            .catch(reject);
                    } else {
                        resolve(updatedJob);
                    }
                })
                .catch(reject);
        });
    }

    static deleteJob(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            db
                .updateTable('job_configurations')
                .set({
                    deleted_at: new Date(),
                    active: false,
                    updated_at: new Date()
                })
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .execute()
                .then(() => resolve())
                .catch(reject);
        });
    }

    static executeJob(id: number): Promise<ExecutionResult> {
        return new Promise((resolve, reject) => {
            // Primeiro buscar a configuração do job
            db
                .selectFrom('job_configurations')
                .select(['id', 'name', 'active'])
                .where('id', '=', id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((jobConfig: any) => {
                    if (!jobConfig) {
                        reject(new Error('Configuração de job não encontrada'));
                        return;
                    }

                    if (!jobConfig.active) {
                        reject(new Error('Configuração de job não está ativa'));
                        return;
                    }

                    // Criar execução
                    const executionData = {
                        job_config_id: jobConfig.id,
                        status: ExecutionStatus.RUNNING,
                        started_at: new Date(),
                        logs: 'Execução do job iniciada...'
                    };

                    db
                        .insertInto('job_executions')
                        .values(executionData as any)
                        .returningAll()
                        .executeTakeFirstOrThrow()
                        .then((execution: any) => {
                            // Simular execução assíncrona
                            setTimeout(() => {
                                db
                                    .updateTable('job_executions')
                                    .set({
                                        status: ExecutionStatus.SUCCESS,
                                        finished_at: new Date(),
                                        logs: 'Execução do job completada com sucesso'
                                    })
                                    .where('id', '=', execution.id)
                                    .execute()
                                    .catch((err) => {
                                        console.error('Erro ao atualizar execução assíncrona:', err);
                                    });
                            }, 1000);

                            const result: ExecutionResult = {
                                executionId: execution.id,
                                jobConfigurationId: jobConfig.id,
                                jobName: jobConfig.name,
                                status: execution.status,
                                startedAt: execution.started_at
                            };

                            resolve(result);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    static validateJobData(data: CreateJobConfigurationData | UpdateJobConfigurationData): string | null {
        if ('name' in data && data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                return 'Nome é obrigatório';
            }
            if (data.name.length > 255) {
                return 'Nome deve ter no máximo 255 caracteres';
            }
        }

        if ('cron_pattern' in data && data.cron_pattern !== undefined) {
            if (!data.cron_pattern || typeof data.cron_pattern !== 'string' || data.cron_pattern.trim().length === 0) {
                return 'Padrão cron é obrigatório';
            }
            if (data.cron_pattern.length > 100) {
                return 'Padrão cron deve ter no máximo 100 caracteres';
            }
        }

        if ('job_type' in data && data.job_type !== undefined) {
            const validTypes = Object.values(JobType);
            if (!validTypes.includes(data.job_type)) {
                return 'Tipo de job inválido';
            }
        }

        if ('description' in data && data.description !== undefined && data.description !== null) {
            if (typeof data.description !== 'string') {
                return 'Descrição deve ser uma string';
            }
            if (data.description.length > 500) {
                return 'Descrição deve ter no máximo 500 caracteres';
            }
        }

        if ('active' in data && data.active !== undefined) {
            if (typeof data.active !== 'boolean') {
                return 'Status ativo deve ser verdadeiro ou falso';
            }
        }

        return null;
    }
}