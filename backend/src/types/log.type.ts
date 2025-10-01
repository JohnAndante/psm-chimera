// Log types and interfaces for the unified logging system

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

export interface LogWriteOptions {
    category: string;
    level: LogLevel;
    message: string;
    metadata?: Record<string, any>;
    sessionId?: string;
    source?: string;
}

export interface LogServiceConfig {
    fileLogsEnabled: boolean;
    databaseLogsEnabled: boolean;
    logDirectory: string;
    maxFileAgedays: number;
    maxDatabaseAgeDays: number;
    timezone: string;
}

export interface LogCleanupResult {
    filesRemoved: number;
    databaseRecordsRemoved: number;
    totalCleaned: number;
}

export interface LogStatistics {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    recentSessions: string[];
    oldestLog?: Date;
    newestLog?: Date;
}

export interface ParsedLogLine {
    time: string;
    level: LogLevel;
    category: string;
    message: string;
}

// Error types for log operations
export class LogServiceError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'LogServiceError';
    }
}

export class LogFileError extends LogServiceError {
    constructor(message: string) {
        super(message, 'LOG_FILE_ERROR');
    }
}

export class LogDatabaseError extends LogServiceError {
    constructor(message: string) {
        super(message, 'LOG_DATABASE_ERROR');
    }
}
