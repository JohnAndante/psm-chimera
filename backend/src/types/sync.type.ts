// Tipos para sistema de sincronização RP → CresceVendas

export interface SyncConfiguration {
    id: number;
    name: string;
    source_integration_id: number; // RP Integration
    target_integration_id: number; // CresceVendas Integration
    notification_channel_id?: number; // Telegram notifications
    stores: number[]; // IDs das lojas ou [] para todas
    schedule: {
        sync_time: string; // ex: "05:00"
        compare_time: string; // ex: "05:30"
    };
    options: {
        batch_size: number;
        cleanup_old_data: boolean;
        send_notifications: boolean;
    };
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateSyncConfigurationData {
    name: string;
    source_integration_id: number;
    target_integration_id: number;
    notification_channel_id?: number;
    stores?: number[];
    schedule: {
        sync_time: string;
        compare_time: string;
    };
    options?: {
        batch_size?: number;
        cleanup_old_data?: boolean;
        send_notifications?: boolean;
    };
    active?: boolean;
}

export interface SyncExecutionRequest {
    sync_config_id?: number; // Para execução de config salva
    source_integration_id?: number; // Para execução ad-hoc
    target_integration_id?: number;
    notification_channel_id?: number;
    store_ids?: number[]; // Específicas ou [] para todas
    options?: {
        force_sync?: boolean;
        skip_comparison?: boolean;
    };
}

export interface SyncExecutionResult {
    execution_id: string;
    sync_config_id?: number;
    status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    started_at: Date;
    finished_at?: Date;
    stores_processed: {
        store_id: number;
        store_name: string;
        products_synced: number;
        status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
        error?: string;
    }[];
    summary: {
        total_stores: number;
        successful_stores: number;
        failed_stores: number;
        total_products: number;
        execution_time: number; // milliseconds
    };
    comparison_results?: ComparisonResult[];
}

export interface ComparisonResult {
    store_id: number;
    store_name: string;
    differences_found: number;
    missing_products: number;
    price_differences: number;
    status_differences: number;
    details: {
        missing: ProductComparison[];
        price_diff: ProductComparison[];
        status_diff: ProductComparison[];
    };
}

export interface ProductComparison {
    product_code: string;
    rp_data?: {
        price: number;
        final_price: number;
        active: boolean;
    };
    crescevendas_data?: {
        price: number;
        final_price: number;
        active: boolean;
    };
    difference_type: 'MISSING' | 'PRICE_DIFF' | 'STATUS_DIFF';
}

export interface SyncExecutionFilters {
    sync_config_id?: number;
    status?: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    date_from?: Date;
    date_to?: Date;
    store_id?: number;
}

// Enum para status de execução
export enum SyncStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

// Enum para tipos de diferença
export enum DifferenceType {
    MISSING = 'MISSING',
    PRICE_DIFF = 'PRICE_DIFF',
    STATUS_DIFF = 'STATUS_DIFF'
}
