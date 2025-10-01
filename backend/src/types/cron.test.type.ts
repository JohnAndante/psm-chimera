/**
 * Cron Test Types
 *
 * Tipos para funcionalidades de teste do sistema cron
 */

export interface CronTestResults {
    execution: number;
    timestamp: string;
    database: {
        stores: number;
        integrations: number;
        notification_channels: number;
        sync_configurations: number;
    };
    system: {
        memory: NodeJS.MemoryUsage;
        uptime: number;
    };
    sync_test?: {
        success: boolean;
        message?: string;
        error?: string;
    };
}

export interface CronTestConfig {
    running: boolean;
    nextExecution?: string;
    executionCount?: number;
    lastExecution?: Date;
}

export interface TestSyncConfig {
    storeId: number;
    syncConfigId: number;
}

export interface CronTestStatus {
    running: boolean;
    nextExecution?: string;
    executionCount: number;
    lastExecution: Date | null;
    testStoreId: string;
    testSyncConfigId: string;
}

export interface TestNotificationData {
    execution: number;
    timestamp: string;
    database_test: any;
    sync_test?: any;
    notification_sent: boolean;
}
