export enum JobType {
    SYNC_PRODUCTS = 'SYNC_PRODUCTS',
    COMPARE_DATA = 'COMPARE_DATA',
    CLEANUP_LOGS = 'CLEANUP_LOGS',
    CUSTOM = 'CUSTOM'
}

export enum ExecutionStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface JobConfigurationData {
    id: number;
    name: string;
    description: string | null;
    cron_pattern: string;
    job_type: JobType;
    config: unknown;
    active: boolean;
    integration_id: number | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface CreateJobConfigurationData {
    name: string;
    description?: string;
    cron_pattern: string;
    job_type: JobType;
    config?: unknown;
    active?: boolean;
    integration_id?: number;
}

export interface UpdateJobConfigurationData {
    name?: string;
    description?: string;
    cron_pattern?: string;
    job_type?: JobType;
    config?: unknown;
    active?: boolean;
    integration_id?: number;
}

export interface JobExecutionData {
    id: string;
    job_config_id: number;
    status: ExecutionStatus;
    started_at: Date;
    finished_at: Date | null;
    logs: string | null;
    metrics: unknown | null;
    error_details: unknown | null;
}

export interface JobConfigurationFilters {
    active?: boolean;
    job_type?: JobType;
    integration_id?: number;
    search?: string;
}

export interface JobExecutionFilters {
    job_config_id?: number;
    status?: ExecutionStatus;
    date_from?: Date;
    date_to?: Date;
    started_after?: Date;
    started_before?: Date;
    finished_after?: Date;
    finished_before?: Date;
    limit?: number;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface JobWithIntegration extends JobConfigurationData {
    integration?: {
        id: number;
        name: string;
        type: string;
    };
}

export interface JobWithExecutions extends JobConfigurationData {
    integration?: {
        id: number;
        name: string;
        type: string;
        config?: unknown;
    };
    executions?: JobExecutionData[];
}

export interface ExecutionResult {
    executionId: string;
    jobConfigurationId: number;
    jobName: string;
    status: ExecutionStatus;
    startedAt: Date;
}

export interface JobExecutionWithConfig extends JobExecutionData {
    job_config: {
        name: string;
        cron_pattern: string;
        job_type: JobType;
        config?: unknown;
    };
}

export interface ExecutionLogsData {
    executionId: string;
    jobName: string;
    status: ExecutionStatus;
    startedAt: Date;
    finishedAt: Date | null;
    logs: string | null;
    error: unknown | null;
}
