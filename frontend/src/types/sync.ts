/* eslint-disable @typescript-eslint/no-explicit-any */
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface IntegrationRef {
    id: number | string;
    name?: string;
    [key: string]: any;
}

export interface NotificationChannelRef {
    id: number | string;
    name?: string;
    [key: string]: any;
}

export interface SyncConfiguration {
    id: number | string;
    name: string;
    description?: string;
    active: boolean;
    source_integration?: IntegrationRef | null;
    target_integration?: IntegrationRef | null;
    source_integration_id?: number;
    target_integration_id?: number;
    notification_channel?: NotificationChannelRef | null;
    notification_channel_id?: number;
    store_ids: number[];
    schedule?: any;
    schedule_enabled: boolean;
    schedule_cron?: string;
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
        [key: string]: any;
    };
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

export interface SyncExecution {
    id: number | string;
    sync_config_id?: number | string;
    status: SyncStatus;
    started_at: string;
    finished_at?: string;
    created_at?: string;
    summary: {
        total_stores: number;
        stores_processed: number;
        products_fetched: number;
        products_sent: number;
        products_updated?: number;
        errors: number;
        [key: string]: any;
    };
    error_message?: string;
    execution_log?: string;
    [key: string]: any;
}

export interface SyncExecutionRequest {
    sync_config_id?: number | string;
    source_integration_id?: number;
    target_integration_id?: number;
    notification_channel_id?: number;
    store_ids?: number[];
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
        batch_size?: number;
        timeout_minutes?: number;
        [key: string]: any;
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
        [key: string]: any;
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
        [key: string]: any;
    };
}
