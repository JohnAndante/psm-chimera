// Frontend types for log management

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    category: string;
    message: string;
    metadata?: Record<string, any>;
    session_id?: string;
    source: string;
    created_at: Date;
}

export interface LogFilters {
    startDate?: Date;
    endDate?: Date;
    level?: LogLevel;
    category?: string;
    sessionId?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface LogStatistics {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    recentSessions: string[];
    oldestLog?: Date;
    newestLog?: Date;
}

export interface LogCleanupResult {
    filesRemoved: number;
    databaseRecordsRemoved: number;
    totalCleaned: number;
}

export interface LogStreamMessage {
    type: 'connected' | 'log' | 'keepalive' | 'error';
    message?: string;
    data?: LogEntry;
    error?: string;
}

// UI-specific types
export interface LogViewerConfig {
    realTime: boolean;
    maxLogs: number;
    autoScroll: boolean;
    showMetadata: boolean;
    groupBySessions: boolean;
}

export interface LogFilterPreset {
    id: string;
    name: string;
    filters: LogFilters;
    color?: string;
}

// Level configuration for UI
export const LOG_LEVEL_CONFIG = {
    DEBUG: {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: '🔍',
        label: 'Debug'
    },
    INFO: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: 'ℹ️',
        label: 'Info'
    },
    WARN: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '⚠️',
        label: 'Warning'
    },
    ERROR: {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '❌',
        label: 'Error'
    },
    SUCCESS: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✅',
        label: 'Success'
    }
} as const;

// Category configuration for UI
export const LOG_CATEGORY_CONFIG = {
    AUTH: { icon: '🔐', color: 'text-purple-600' },
    API: { icon: '🌐', color: 'text-blue-600' },
    CRON_TEST: { icon: '⏰', color: 'text-indigo-600' },
    SYNC: { icon: '🔄', color: 'text-green-600' },
    TELEGRAM: { icon: '📱', color: 'text-cyan-600' },
    SYSTEM: { icon: '⚙️', color: 'text-gray-600' },
    RP: { icon: '🏪', color: 'text-orange-600' },
    CV: { icon: '💰', color: 'text-yellow-600' },
    DATABASE: { icon: '🗄️', color: 'text-slate-600' },
} as const;

export type LogCategory = keyof typeof LOG_CATEGORY_CONFIG;
