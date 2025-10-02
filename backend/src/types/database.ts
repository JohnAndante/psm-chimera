// Tipos gerados a partir do schema Prisma para Kysely
export type UserType = 'ADMIN' | 'USER';
export type NotificationType = 'TELEGRAM' | 'EMAIL' | 'WEBHOOK';
export type JobType = 'SYNC_PRODUCTS' | 'COMPARE_DATA' | 'CLEANUP_LOGS' | 'CUSTOM';
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type IntegrationType = 'RP' | 'CRESCEVENDAS' | 'TELEGRAM' | 'EMAIL' | 'WEBHOOK';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export interface UserTable {
    id?: number; // Optional for inserts (auto-increment)
    email: string;
    name: string | null;
    role: UserType;
    active: boolean
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface AuthTable {
    id?: number; // Optional for inserts (auto-increment)
    user_id: number;
    email: string;
    password_hash: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface IntegrationTable {
    id?: number; // Optional for inserts (auto-increment)
    name: string;
    type: IntegrationType;
    base_url: string | null;
    email: string | null;
    password: string | null;
    config: unknown | null;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface IntegrationKeyTable {
    id: number;
    integration_id: number;
    key: string;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface StoreTable {
    id: number;
    name: string;
    registration: string;
    document: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface ProductTable {
    id: string;
    code: number;
    price: number;
    final_price: number;
    limit: number;
    store_id: number;
    starts_at: string | null;
    expires_at: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface NotificationChannelTable {
    id: number;
    name: string;
    type: NotificationType;
    config: unknown;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface JobConfigurationTable {
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

export interface JobExecutionTable {
    id: string;
    job_config_id: number;
    status: ExecutionStatus;
    started_at: Date;
    finished_at: Date | null;
    logs: string | null;
    metrics: unknown | null;
    error_details: unknown | null;
}

export interface JobNotificationTable {
    id: number;
    job_config_id: number;
    notification_channel_id: number;
    on_success: boolean;
    on_failure: boolean;
    on_start: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface SyncExecutionTable {
    id: string;
    sync_config_id: number | null;
    status: ExecutionStatus;
    started_at: Date;
    finished_at: Date | null;
    stores_processed: unknown; // JSON
    summary: unknown; // JSON
    comparison_results: unknown | null; // JSON
    execution_logs: string | null;
    error_details: unknown | null; // JSON
    created_at: Date;
}

export interface SyncConfigurationTable {
    id: number;
    name: string;
    description: string | null;
    source_integration_id: number;
    target_integration_id: number;
    notification_channel_id: number | null;
    store_ids: unknown; // JSON array
    schedule: unknown | null; // JSON object
    options: unknown; // JSON object
    active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface LogEntryTable {
    id: string; // UUID
    timestamp: Date;
    level: LogLevel;
    category: string;
    message: string;
    metadata: unknown | null; // JSON
    session_id: string | null;
    source: string;
    created_at: Date;
}

export interface Database {
    users: UserTable;
    authentications: AuthTable;
    integrations: IntegrationTable;
    integration_keys: IntegrationKeyTable;
    stores: StoreTable;
    products: ProductTable;
    notification_channels: NotificationChannelTable;
    job_configurations: JobConfigurationTable;
    job_executions: JobExecutionTable;
    job_notifications: JobNotificationTable;
    sync_executions: SyncExecutionTable;
    sync_configurations: SyncConfigurationTable;
    log_entries: LogEntryTable;
}
