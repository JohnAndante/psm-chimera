import { db } from '../factory/database.factory';
import {
    JobExecutionData,
    JobExecutionFilters,
    JobExecutionWithConfig,
    ExecutionLogsData
} from '../types/job.type';

class JobExecutionService {

    getAllExecutions(filters: JobExecutionFilters = {}): Promise<JobExecutionWithConfig[]> {
        return new Promise((resolve, reject) => {
            let query = db
                .selectFrom('job_executions')
                .leftJoin('job_configurations', 'job_executions.job_config_id', 'job_configurations.id')
                .select([
                    'job_executions.id',
                    'job_executions.job_config_id',
                    'job_executions.status',
                    'job_executions.started_at',
                    'job_executions.finished_at',
                    'job_executions.logs',
                    'job_executions.error_details',
                    'job_configurations.name as job_name',
                    'job_configurations.cron_pattern',
                    'job_configurations.job_type'
                ]);

            // Filtro por job configuration ID
            if (filters.job_config_id) {
                query = query.where('job_executions.job_config_id', '=', filters.job_config_id);
            }

            // Filtro por status
            if (filters.status) {
                query = query.where('job_executions.status', '=', filters.status);
            }

            // Filtro por data de início
            if (filters.started_after) {
                query = query.where('job_executions.started_at', '>=', filters.started_after);
            }

            if (filters.started_before) {
                query = query.where('job_executions.started_at', '<=', filters.started_before);
            }

            // Filtro por data de fim
            if (filters.finished_after) {
                query = query.where('job_executions.finished_at', '>=', filters.finished_after);
            }

            if (filters.finished_before) {
                query = query.where('job_executions.finished_at', '<=', filters.finished_before);
            }

            // Limite padrão de 50 registros
            const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 500) : 50;

            query
                .orderBy('job_executions.started_at', 'desc')
                .limit(limit)
                .execute()
                .then((rows: any[]) => {
                    const executions = rows.map(row => ({
                        id: row.id,
                        job_config_id: row.job_config_id,
                        status: row.status,
                        started_at: row.started_at,
                        finished_at: row.finished_at,
                        logs: row.logs,
                        metrics: null,
                        error_details: row.error_details,
                        job_config: {
                            name: row.job_name,
                            cron_pattern: row.cron_pattern,
                            job_type: row.job_type
                        }
                    }));
                    resolve(executions);
                })
                .catch(reject);
        });
    }

    getExecutionById(id: string): Promise<JobExecutionWithConfig | null> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('job_executions')
                .leftJoin('job_configurations', 'job_executions.job_config_id', 'job_configurations.id')
                .select([
                    'job_executions.id',
                    'job_executions.job_config_id',
                    'job_executions.status',
                    'job_executions.started_at',
                    'job_executions.finished_at',
                    'job_executions.logs',
                    'job_executions.error_details',
                    'job_configurations.name as job_name',
                    'job_configurations.cron_pattern',
                    'job_configurations.job_type',
                    'job_configurations.config as job_config'
                ])
                .where('job_executions.id', '=', id)
                .executeTakeFirst()
                .then((row: any) => {
                    if (!row) {
                        resolve(null);
                        return;
                    }

                    const execution: JobExecutionWithConfig = {
                        id: row.id,
                        job_config_id: row.job_config_id,
                        status: row.status,
                        started_at: row.started_at,
                        finished_at: row.finished_at,
                        logs: row.logs,
                        metrics: null,
                        error_details: row.error_details,
                        job_config: {
                            name: row.job_name,
                            cron_pattern: row.cron_pattern,
                            job_type: row.job_type,
                            config: row.job_config
                        }
                    };

                    resolve(execution);
                })
                .catch(reject);
        });
    }

    getExecutionLogs(id: string): Promise<ExecutionLogsData | null> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('job_executions')
                .leftJoin('job_configurations', 'job_executions.job_config_id', 'job_configurations.id')
                .select([
                    'job_executions.id',
                    'job_executions.status',
                    'job_executions.started_at',
                    'job_executions.finished_at',
                    'job_executions.logs',
                    'job_executions.error_details',
                    'job_configurations.name as job_name'
                ])
                .where('job_executions.id', '=', id)
                .executeTakeFirst()
                .then((row: any) => {
                    if (!row) {
                        resolve(null);
                        return;
                    }

                    const executionLogs: ExecutionLogsData = {
                        executionId: row.id,
                        jobName: row.job_name,
                        status: row.status,
                        startedAt: row.started_at,
                        finishedAt: row.finished_at,
                        logs: row.logs,
                        error: row.error_details
                    };

                    resolve(executionLogs);
                })
                .catch(reject);
        });
    }

    getExecutionsByJobConfig(jobConfigId: number, limit: number = 10): Promise<JobExecutionData[]> {
        return new Promise((resolve, reject) => {
            db
                .selectFrom('job_executions')
                .selectAll()
                .where('job_config_id', '=', jobConfigId)
                .orderBy('started_at', 'desc')
                .limit(Math.min(limit, 100))
                .execute()
                .then((executions: any[]) => {
                    resolve(executions);
                })
                .catch(reject);
        });
    }

    validateExecutionFilters(filters: JobExecutionFilters): string | null {
        if (filters.limit !== undefined) {
            if (typeof filters.limit !== 'number' || filters.limit < 1 || filters.limit > 500) {
                return 'Limite deve ser um número entre 1 e 500';
            }
        }

        if (filters.job_config_id !== undefined) {
            if (typeof filters.job_config_id !== 'number' || filters.job_config_id < 1) {
                return 'ID da configuração de job deve ser um número válido';
            }
        }

        // Validar datas
        const dateFields = ['started_after', 'started_before', 'finished_after', 'finished_before'];
        for (const field of dateFields) {
            if (filters[field as keyof JobExecutionFilters] !== undefined) {
                const date = filters[field as keyof JobExecutionFilters] as Date;
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    return `Campo ${field} deve ser uma data válida`;
                }
            }
        }

        // Validar que started_after não seja maior que started_before
        if (filters.started_after && filters.started_before) {
            if (filters.started_after > filters.started_before) {
                return 'Data de início deve ser anterior à data de fim para o filtro de início';
            }
        }

        // Validar que finished_after não seja maior que finished_before
        if (filters.finished_after && filters.finished_before) {
            if (filters.finished_after > filters.finished_before) {
                return 'Data de início deve ser anterior à data de fim para o filtro de conclusão';
            }
        }

        return null;
    }
}

export const jobExecutionService = new JobExecutionService();
