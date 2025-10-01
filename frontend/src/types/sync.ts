export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SyncConfiguration {
    id: number;
    name: string;
    description?: string;
    source_integration_id: number;
    target_integration_id: number;
    notification_channel_id?: number;
    store_ids: number[];
    schedule_enabled: boolean;
    schedule_cron?: string;
    options: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
    };
    created_at: string;
    updated_at: string;
}

export interface SyncExecution {
    id: number;
    sync_config_id?: number;
    status: SyncStatus;
    started_at: string;
    completed_at?: string;
    summary: {
        total_stores: number;
        stores_processed: number;
        products_fetched: number;
        products_sent: number;
        products_updated: number;
        errors: number;
    };
    error_message?: string;
    execution_log?: string;
}

export interface SyncExecutionRequest {
    sync_config_id?: number;
    source_integration_id?: number;
    target_integration_id?: number;
    notification_channel_id?: number;
    store_ids?: number[];
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
    };
}

export interface CreateSyncConfigRequest {
    name: string;
    description?: string;
    source_integration_id: number;
    target_integration_id: number;
    notification_channel_id?: number;
    store_ids: number[];
    schedule_enabled: boolean;
    schedule_cron?: string;
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
    };
}

export interface UpdateSyncConfigRequest {
    name?: string;
    description?: string;
    source_integration_id?: number;
    target_integration_id?: number;
    notification_channel_id?: number;
    store_ids?: number[];
    schedule_enabled?: boolean;
    schedule_cron?: string;
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
    };
}
