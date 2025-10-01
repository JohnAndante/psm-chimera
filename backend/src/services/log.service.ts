import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

import { DatabaseFactory } from '../factory/database.factory';
import { TelegramService } from './telegram.service';
import {
    LogLevel,
    LogEntry,
    LogFilters,
    LogWriteOptions,
    LogServiceConfig,
    LogCleanupResult,
    LogStatistics,
    LogServiceError,
    LogFileError,
    LogDatabaseError,
} from '../types/log.type';

/**
 * Unified Logging Service
 *
 * Provides dual-channel logging:
 * 1. File-based logs (for Telegram Bot compatibility)
 * 2. Database logs (for frontend API access)
 *
 * Features:
 * - Automatic cleanup of old files and database records
 * - Real-time log streaming via EventEmitter
 * - Session grouping for execution tracking
 * - Structured metadata support
 * - Error handling and recovery
 */
export class LogService {
    private static instance: LogService;
    private db = DatabaseFactory.getDatabase();
    private eventEmitter = new EventEmitter();
    private telegramService: TelegramService;

    private config: LogServiceConfig = {
        fileLogsEnabled: true,
        databaseLogsEnabled: true,
        logDirectory: './src/logs',
        maxFileAgedays: 7,
        maxDatabaseAgeDays: 30, // Keep more in database for history
        timezone: 'America/Sao_Paulo',
    };

    private constructor() {
        this.telegramService = new TelegramService();
        this.ensureLogDirectory();
    }

    static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    /**
     * Main logging method - writes to both file and database
     */
    async log(options: LogWriteOptions): Promise<void> {
        const timestamp = new Date();
        const logEntry: LogEntry = {
            id: randomUUID(),
            timestamp,
            level: options.level,
            category: options.category,
            message: options.message,
            metadata: options.metadata || undefined,
            session_id: options.sessionId || undefined,
            source: options.source || 'api',
            created_at: timestamp,
        };

        // Dual write with error handling
        const promises: Promise<any>[] = [];

        if (this.config.fileLogsEnabled) {
            promises.push(this.writeToFile(logEntry).catch(error => {
                console.error('File logging error:', error);
                // Don't throw - continue with database logging
            }));
        }

        if (this.config.databaseLogsEnabled) {
            promises.push(this.writeToDatabase(logEntry).catch(error => {
                console.error('Database logging error:', error);
                // Don't throw - file logging might still work
            }));
        }

        await Promise.allSettled(promises);

        // Emit for real-time streaming
        this.eventEmitter.emit('log-added', logEntry);
    }

    /**
     * Convenience methods for different log levels
     */
    async debug(category: string, message: string, metadata?: any, sessionId?: string): Promise<void> {
        return this.log({ level: 'DEBUG', category, message, metadata, sessionId });
    }

    async info(category: string, message: string, metadata?: any, sessionId?: string): Promise<void> {
        return this.log({ level: 'INFO', category, message, metadata, sessionId });
    }

    async warn(category: string, message: string, metadata?: any, sessionId?: string): Promise<void> {
        return this.log({ level: 'WARN', category, message, metadata, sessionId });
    }

    async error(category: string, message: string, metadata?: any, sessionId?: string): Promise<void> {
        return this.log({ level: 'ERROR', category, message, metadata, sessionId });
    }

    async success(category: string, message: string, metadata?: any, sessionId?: string): Promise<void> {
        return this.log({ level: 'SUCCESS', category, message, metadata, sessionId });
    }

    /**
     * Write log entry to file (maintains server-node-fill compatibility)
     */
    private async writeToFile(logEntry: LogEntry): Promise<void> {
        try {
            const logDate = this.formatDate(logEntry.timestamp);
            const logPath = path.join(this.config.logDirectory, `log-${logDate}.txt`);

            const timeStr = this.formatTimestamp(logEntry.timestamp);
            const levelIcon = this.getLevelIcon(logEntry.level);
            const formattedMessage = `${timeStr} ${levelIcon} [${logEntry.category}] ${logEntry.message}\\n`;

            await fs.appendFile(logPath, formattedMessage, 'utf8');
        } catch (error: any) {
            throw new LogFileError(`Failed to write to log file: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Write log entry to database
     */
    private async writeToDatabase(logEntry: LogEntry): Promise<void> {
        try {
            await this.db.insertInto('log_entries').values({
                id: logEntry.id,
                timestamp: logEntry.timestamp,
                level: logEntry.level,
                category: logEntry.category,
                message: logEntry.message,
                metadata: logEntry.metadata ? JSON.stringify(logEntry.metadata) : null,
                session_id: logEntry.session_id,
                source: logEntry.source,
                created_at: logEntry.created_at,
            }).execute();
        } catch (error: any) {
            throw new LogDatabaseError(`Failed to write to database: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Retrieve logs with filtering
     */
    async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
        try {
            let query = this.db.selectFrom('log_entries').selectAll();

            // Apply filters
            if (filters.startDate) {
                query = query.where('timestamp', '>=', filters.startDate);
            }

            if (filters.endDate) {
                query = query.where('timestamp', '<=', filters.endDate);
            }

            if (filters.level) {
                query = query.where('level', '=', filters.level);
            }

            if (filters.category) {
                query = query.where('category', '=', filters.category);
            }

            if (filters.sessionId) {
                query = query.where('session_id', '=', filters.sessionId);
            }

            if (filters.search) {
                query = query.where('message', 'ilike', `%${filters.search}%`);
            }

            // Pagination
            if (filters.offset) {
                query = query.offset(filters.offset);
            }

            const results = await query
                .orderBy('timestamp', 'desc')
                .limit(filters.limit || 100)
                .execute();

            // Parse metadata JSON
            return results.map((row: any) => ({
                ...row,
                metadata: row.metadata ? JSON.parse(row.metadata as string) : null,
            })) as LogEntry[];
        } catch (error: any) {
            throw new LogDatabaseError(`Failed to retrieve logs: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get available log categories
     */
    async getCategories(): Promise<string[]> {
        try {
            const results = await this.db
                .selectFrom('log_entries')
                .select('category')
                .distinct()
                .orderBy('category', 'asc')
                .execute();

            return results.map((row: any) => row.category);
        } catch (error: any) {
            throw new LogDatabaseError(`Failed to retrieve categories: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get log statistics
     */
    async getStatistics(): Promise<LogStatistics> {
        try {
            const [totalResult, levelStats, categoryStats, sessionStats, timeRange] = await Promise.all([
                // Total count
                this.db.selectFrom('log_entries').select(this.db.fn.count('id').as('total')).executeTakeFirst(),

                // By level
                this.db.selectFrom('log_entries')
                    .select(['level', this.db.fn.count('id').as('count')])
                    .groupBy('level')
                    .execute(),

                // By category
                this.db.selectFrom('log_entries')
                    .select(['category', this.db.fn.count('id').as('count')])
                    .groupBy('category')
                    .orderBy('count', 'desc')
                    .limit(10)
                    .execute(),

                // Recent sessions
                this.db.selectFrom('log_entries')
                    .select('session_id')
                    .where('session_id', 'is not', null)
                    .distinct()
                    .orderBy('created_at', 'desc')
                    .limit(10)
                    .execute(),

                // Time range
                this.db.selectFrom('log_entries')
                    .select([
                        this.db.fn.min('timestamp').as('oldest'),
                        this.db.fn.max('timestamp').as('newest')
                    ])
                    .executeTakeFirst(),
            ]);

            const logsByLevel = levelStats.reduce((acc: Record<LogLevel, number>, stat: any) => {
                acc[stat.level as LogLevel] = Number(stat.count);
                return acc;
            }, {} as Record<LogLevel, number>);

            const logsByCategory = categoryStats.reduce((acc: Record<string, number>, stat: any) => {
                acc[stat.category] = Number(stat.count);
                return acc;
            }, {} as Record<string, number>);

            const recentSessions = sessionStats
                .filter((s: any) => s.session_id)
                .map((s: any) => s.session_id as string);

            return {
                totalLogs: Number(totalResult?.total || 0),
                logsByLevel,
                logsByCategory,
                recentSessions,
                oldestLog: timeRange?.oldest ? new Date(timeRange.oldest) : undefined,
                newestLog: timeRange?.newest ? new Date(timeRange.newest) : undefined,
            };
        } catch (error: any) {
            throw new LogDatabaseError(`Failed to retrieve statistics: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Cleanup old logs (files and database)
     */
    async cleanupOldLogs(): Promise<LogCleanupResult> {
        let filesRemoved = 0;
        let databaseRecordsRemoved = 0;

        try {
            // Cleanup files
            if (this.config.fileLogsEnabled) {
                filesRemoved = await this.cleanupLogFiles();
            }

            // Cleanup database
            if (this.config.databaseLogsEnabled) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - this.config.maxDatabaseAgeDays);

                const result = await this.db
                    .deleteFrom('log_entries')
                    .where('timestamp', '<', cutoffDate)
                    .execute();

                databaseRecordsRemoved = Number(result.numDeletedRows || 0);
            }

            const totalCleaned = filesRemoved + databaseRecordsRemoved;

            // Log cleanup results
            await this.info('SYSTEM', `Limpeza concluída: ${filesRemoved} arquivos, ${databaseRecordsRemoved} registros`, {
                files_removed: filesRemoved,
                db_records_removed: databaseRecordsRemoved,
                total_cleaned: totalCleaned,
            });

            return { filesRemoved, databaseRecordsRemoved, totalCleaned };
        } catch (error) {
            await this.error('SYSTEM', `Erro na limpeza de logs: ${(error as any)?.message}`, { error: (error as any)?.stack });
            throw new LogServiceError(`Cleanup failed: ${(error as any)?.message || 'Unknown error'}`, 'CLEANUP_ERROR');
        }
    }

    /**
     * Cleanup old log files
     */
    private async cleanupLogFiles(): Promise<number> {
        try {
            const files = await fs.readdir(this.config.logDirectory);
            const logFiles = files.filter(file => file.startsWith('log-') && file.endsWith('.txt'));
            let removedCount = 0;

            for (const file of logFiles) {
                const filePath = path.join(this.config.logDirectory, file);
                const stats = await fs.stat(filePath);
                const fileAge = Date.now() - stats.mtime.getTime();
                const maxAge = this.config.maxFileAgedays * 24 * 60 * 60 * 1000;

                if (fileAge > maxAge) {
                    await fs.unlink(filePath);
                    removedCount++;
                }
            }

            return removedCount;
        } catch (error: any) {
            throw new LogFileError(`Failed to cleanup log files: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Real-time log streaming
     */
    onLogAdded(callback: (log: LogEntry) => void): void {
        this.eventEmitter.on('log-added', callback);
    }

    removeLogListener(callback: (log: LogEntry) => void): void {
        this.eventEmitter.removeListener('log-added', callback);
    }

    /**
     * Ensure log directory exists
     */
    private async ensureLogDirectory(): Promise<void> {
        try {
            await fs.mkdir(this.config.logDirectory, { recursive: true });
        } catch (error: any) {
            console.error('Failed to create log directory:', error);
        }
    }

    /**
     * Format timestamp for file logs (server-node-fill compatible)
     */
    private formatTimestamp(date: Date): string {
        // Convert to Brazil timezone (UTC-3)
        const brazilTime = new Date(date.getTime() - (3 * 60 * 60 * 1000));

        const hours = brazilTime.getHours().toString().padStart(2, '0');
        const minutes = brazilTime.getMinutes().toString().padStart(2, '0');
        const seconds = brazilTime.getSeconds().toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Format date for file names
     */
    private formatDate(date: Date): string {
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    /**
     * Get icon for log level (server-node-fill compatible)
     */
    private getLevelIcon(level: LogLevel): string {
        switch (level) {
            case 'ERROR': return '❌';
            case 'WARN': return '⚠️';
            case 'SUCCESS': return '✅';
            case 'INFO': return 'ℹ️';
            case 'DEBUG': return '🔍';
            default: return '📝';
        }
    }
}

// Export singleton instance
export const logService = LogService.getInstance();
