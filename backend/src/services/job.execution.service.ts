import { db } from '../factory/database.factory';
import { jobConfigService } from './jobConfig.service';
import { notificationChannelService } from './notificationChannel.service';
import { getTelegramService } from './telegram.service';
import {
    ExecutionStatus,
    JobType,
} from '../types/job.type';
import {
    NotificationChannelType,
    TelegramConfig
} from '../types/notification.type';

export interface JobExecutionRequest {
    job_config_id: number;
    store_id?: number;
    notification_channel_id?: number;
    manual_trigger?: boolean;
    triggered_by?: string;
}

export interface JobExecutionResponse {
    execution_id: string;
    job_config_id: number;
    job_name: string;
    status: ExecutionStatus;
    started_at: Date;
    store_info?: {
        id: number;
        name: string;
        registration: string;
    };
    notification_sent?: boolean;
}

export interface SyncJobRequest {
    store_id: number;
    notification_channel_id?: number;
    force_sync?: boolean;
}

export class JobExecutionService {

    /**
     * Executa um job sob demanda
     */
    static executeJob(request: JobExecutionRequest): Promise<JobExecutionResponse> {
        return new Promise((resolve, reject) => {
            console.log(`[JOB_EXEC] Iniciando execução de job: ${request.job_config_id}`);

            // Buscar configuração do job
            jobConfigService.getJobById(request.job_config_id)
                .then((jobConfig: any) => {
                    if (!jobConfig) {
                        reject(new Error('Configuração de job não encontrada'));
                        return;
                    }

                    if (!jobConfig.active) {
                        reject(new Error('Configuração de job não está ativa'));
                        return;
                    }

                    // Buscar informações da loja se fornecida
                    const storePromise = request.store_id ?
                        db.selectFrom('stores')
                            .select(['id', 'name', 'registration'])
                            .where('id', '=', request.store_id)
                            .where('deleted_at', 'is', null)
                            .executeTakeFirst() :
                        Promise.resolve(null);

                    storePromise.then((store: any) => {
                        // Criar execução
                        const executionData = {
                            job_config_id: jobConfig.id,
                            status: ExecutionStatus.RUNNING,
                            started_at: new Date(),
                            logs: JSON.stringify({
                                message: 'Execução iniciada manualmente',
                                triggered_by: request.triggered_by || 'system',
                                store_id: request.store_id,
                                notification_channel_id: request.notification_channel_id,
                                timestamp: new Date().toISOString()
                            })
                        };

                        db.insertInto('job_executions')
                            .values(executionData as any)
                            .returningAll()
                            .executeTakeFirstOrThrow()
                            .then((execution: any) => {
                                console.log(`[JOB_EXEC] Execução criada: ${execution.id}`);

                                // Enviar notificação de início se configurado
                                const notificationPromise = request.notification_channel_id ?
                                    this.sendJobStartNotification(
                                        execution.id,
                                        jobConfig.name,
                                        store?.name,
                                        request.notification_channel_id
                                    ).catch(error => {
                                        console.error('[JOB_EXEC] Erro ao enviar notificação:', error);
                                        return false;
                                    }) :
                                    Promise.resolve(false);

                                notificationPromise.then(notificationSent => {
                                    // Executar job em background
                                    this.executeJobInBackground(
                                        execution.id,
                                        jobConfig,
                                        store,
                                        request.notification_channel_id
                                    );

                                    const response: JobExecutionResponse = {
                                        execution_id: execution.id,
                                        job_config_id: jobConfig.id,
                                        job_name: jobConfig.name,
                                        status: execution.status,
                                        started_at: execution.started_at,
                                        notification_sent: notificationSent
                                    };

                                    if (store) {
                                        response.store_info = {
                                            id: store.id,
                                            name: store.name,
                                            registration: store.registration
                                        };
                                    }

                                    resolve(response);
                                });
                            })
                            .catch(reject);
                    }).catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Executa sincronização de loja com notificação
     */
    static executeSyncJob(request: SyncJobRequest): Promise<JobExecutionResponse> {
        return new Promise((resolve, reject) => {
            console.log(`[JOB_EXEC] Iniciando sincronização da loja: ${request.store_id}`);

            // Buscar loja
            db.selectFrom('stores')
                .select(['id', 'name', 'registration', 'active'])
                .where('id', '=', request.store_id)
                .where('deleted_at', 'is', null)
                .executeTakeFirst()
                .then((store: any) => {
                    if (!store) {
                        reject(new Error('Loja não encontrada'));
                        return;
                    }

                    if (!store.active) {
                        reject(new Error('Loja está inativa'));
                        return;
                    }

                    // Buscar ou criar job de sincronização
                    db.selectFrom('job_configurations')
                        .selectAll()
                        .where('job_type', '=', JobType.SYNC_PRODUCTS)
                        .where('active', '=', true)
                        .where('deleted_at', 'is', null)
                        .executeTakeFirst()
                        .then((syncJob: any) => {
                            let jobPromise: Promise<any>;

                            if (!syncJob) {
                                // Criar job de sincronização padrão
                                const newJobData = {
                                    name: 'Sincronização de Produtos',
                                    description: 'Job automático para sincronização de produtos entre lojas',
                                    cron_pattern: '0 */6 * * *', // A cada 6 horas
                                    job_type: JobType.SYNC_PRODUCTS,
                                    config: { auto_created: true },
                                    active: true,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                };

                                jobPromise = db.insertInto('job_configurations')
                                    .values(newJobData as any)
                                    .returningAll()
                                    .executeTakeFirstOrThrow();
                            } else {
                                jobPromise = Promise.resolve(syncJob);
                            }

                            jobPromise.then((jobConfig: any) => {
                                // Executar job
                                this.executeJob({
                                    job_config_id: jobConfig.id,
                                    store_id: request.store_id,
                                    notification_channel_id: request.notification_channel_id,
                                    manual_trigger: true,
                                    triggered_by: 'sync_endpoint'
                                }).then(resolve).catch(reject);
                            }).catch(reject);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Envia notificação de início de job
     */
    private static sendJobStartNotification(
        executionId: string,
        jobName: string,
        storeName: string | undefined,
        channelId: number
    ): Promise<boolean> {
        return new Promise((resolve) => {
            notificationChannelService.getChannelById(channelId)
                .then((channel: any) => {
                    if (!channel || !channel.active) {
                        console.warn('[JOB_EXEC] Canal de notificação não encontrado ou inativo');
                        resolve(false);
                        return;
                    }

                    if (channel.type === NotificationChannelType.TELEGRAM) {
                        const telegramConfig = channel.config as TelegramConfig;
                        const telegramService = getTelegramService(telegramConfig);

                        telegramService.sendJobStartedNotification(jobName, storeName)
                            .then(result => {
                                console.log(`[JOB_EXEC] Notificação de início enviada: ${result.success}`);
                                resolve(result.success);
                            })
                            .catch(error => {
                                console.error('[JOB_EXEC] Erro ao enviar notificação de início:', error);
                                resolve(false);
                            });
                    } else {
                        console.warn(`[JOB_EXEC] Tipo de canal não suportado: ${channel.type}`);
                        resolve(false);
                    }
                })
                .catch(error => {
                    console.error('[JOB_EXEC] Erro ao buscar canal:', error);
                    resolve(false);
                });
        });
    }

    /**
     * Executa job em background
     */
    private static executeJobInBackground(
        executionId: string,
        jobConfig: any,
        store: any,
        notificationChannelId?: number
    ): void {
        const startTime = Date.now();

        setTimeout(() => {
            console.log(`[JOB_EXEC] Executando job em background: ${executionId}`);

            // Simular execução do job baseado no tipo
            this.simulateJobExecution(jobConfig, store)
                .then(result => {
                    const duration = Date.now() - startTime;
                    const status = result.success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED;

                    // Atualizar execução
                    const updateData: {
                        status: ExecutionStatus;
                        finished_at: Date;
                        logs: string;
                        updated_at: Date;
                        error_details?: string;
                    } = {
                        status,
                        finished_at: new Date(),
                        logs: JSON.stringify({
                            success: result.success,
                            details: result.details,
                            error: result.error,
                            timestamp: new Date().toISOString()
                        }),
                        updated_at: new Date()
                    };

                    if (result.error) {
                        updateData.error_details = JSON.stringify({
                            error: result.error,
                            timestamp: new Date().toISOString()
                        });
                    }

                    db.updateTable('job_executions')
                        .set(updateData as any)
                        .where('id', '=', executionId)
                        .execute()
                        .then(() => {
                            console.log(`[JOB_EXEC] Execução finalizada: ${executionId} - ${status}`);

                            // Enviar notificação de conclusão
                            if (notificationChannelId) {
                                this.sendJobCompleteNotification(
                                    jobConfig.name,
                                    result.success,
                                    duration,
                                    result.details || result.error,
                                    store?.name,
                                    notificationChannelId
                                );
                            }
                        })
                        .catch(error => {
                            console.error('[JOB_EXEC] Erro ao atualizar execução:', error);
                        });
                })
                .catch(error => {
                    console.error('[JOB_EXEC] Erro na execução do job:', error);

                    // Marcar como falha
                    db.updateTable('job_executions')
                        .set({
                            status: ExecutionStatus.FAILED,
                            finished_at: new Date(),
                            error_details: JSON.stringify({
                                error: error.message || 'Erro desconhecido',
                                timestamp: new Date().toISOString()
                            }),
                            updated_at: new Date()
                        } as any)
                        .where('id', '=', executionId)
                        .execute()
                        .catch(updateError => {
                            console.error('[JOB_EXEC] Erro ao atualizar falha:', updateError);
                        });
                });

        }, 1000); // Simular delay inicial
    }

    /**
     * Simula execução de job baseado no tipo
     */
    private static simulateJobExecution(jobConfig: any, store: any): Promise<{
        success: boolean;
        details?: string;
        error?: string;
    }> {
        return new Promise((resolve) => {
            const executionTime = Math.random() * 5000 + 2000; // 2-7 segundos

            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% de sucesso

                if (success) {
                    let details = '';

                    switch (jobConfig.job_type) {
                        case JobType.SYNC_PRODUCTS:
                            const productCount = Math.floor(Math.random() * 500) + 50;
                            details = `${productCount} produtos sincronizados`;
                            break;
                        case JobType.COMPARE_DATA:
                            const differences = Math.floor(Math.random() * 10);
                            details = `${differences} diferenças encontradas`;
                            break;
                        case JobType.CLEANUP_LOGS:
                            const cleaned = Math.floor(Math.random() * 1000) + 100;
                            details = `${cleaned} registros de log limpos`;
                            break;
                        default:
                            details = 'Job executado com sucesso';
                    }

                    resolve({ success: true, details });
                } else {
                    const errors = [
                        'Falha na conexão com a API',
                        'Timeout na operação',
                        'Dados inválidos encontrados',
                        'Erro de permissão',
                        'Limite de rate excedido'
                    ];
                    const error = errors[Math.floor(Math.random() * errors.length)];
                    resolve({ success: false, error });
                }
            }, executionTime);
        });
    }

    /**
     * Envia notificação de conclusão de job
     */
    private static sendJobCompleteNotification(
        jobName: string,
        success: boolean,
        duration: number,
        details: string | undefined,
        storeName: string | undefined,
        channelId: number
    ): void {
        notificationChannelService.getChannelById(channelId)
            .then((channel: any) => {
                if (!channel || !channel.active) {
                    return;
                }

                if (channel.type === NotificationChannelType.TELEGRAM) {
                    const telegramConfig = channel.config as TelegramConfig;
                    const telegramService = getTelegramService(telegramConfig);

                    telegramService.sendJobCompletedNotification(
                        jobName,
                        success,
                        duration,
                        details,
                        storeName
                    ).then(result => {
                        console.log(`[JOB_EXEC] Notificação de conclusão enviada: ${result.success}`);
                    }).catch(error => {
                        console.error('[JOB_EXEC] Erro ao enviar notificação de conclusão:', error);
                    });
                }
            })
            .catch(error => {
                console.error('[JOB_EXEC] Erro ao buscar canal para notificação:', error);
            });
    }

    /**
     * Lista execuções em andamento
     */
    static getRunningExecutions(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            db.selectFrom('job_executions')
                .leftJoin('job_configurations', 'job_executions.job_config_id', 'job_configurations.id')
                .select([
                    'job_executions.id',
                    'job_executions.status',
                    'job_executions.started_at',
                    'job_configurations.name as job_name',
                    'job_configurations.job_type'
                ])
                .where('job_executions.status', 'in', [ExecutionStatus.PENDING, ExecutionStatus.RUNNING])
                .orderBy('job_executions.started_at', 'desc')
                .execute()
                .then(resolve)
                .catch(reject);
        });
    }
}
