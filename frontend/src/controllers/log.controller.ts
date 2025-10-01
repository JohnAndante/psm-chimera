import type {
    LogEntry,
    LogFilters,
    LogStatistics,
    LogCleanupResult,
    LogStreamMessage,
    LogLevel
} from '../types/log';

/**
 * Log API Controller for Frontend
 *
 * Handles all log-related API communications with the backend
 */
export class LogAPIController {
    private static readonly BASE_URL = '/api/v1/logs';

    /**
     * Get logs with filtering support
     */
    static async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
        const params = new URLSearchParams();

        if (filters.startDate) {
            params.append('startDate', filters.startDate.toISOString());
        }
        if (filters.endDate) {
            params.append('endDate', filters.endDate.toISOString());
        }
        if (filters.level) {
            params.append('level', filters.level);
        }
        if (filters.category) {
            params.append('category', filters.category);
        }
        if (filters.sessionId) {
            params.append('sessionId', filters.sessionId);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.limit) {
            params.append('limit', filters.limit.toString());
        }
        if (filters.offset) {
            params.append('offset', filters.offset.toString());
        }

        const url = `${this.BASE_URL}?${params.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }

        const data = await response.json();

        // Convert timestamp strings back to Date objects
        return data.data.map((log: Record<string, unknown>) => ({
            ...log,
            timestamp: new Date(log.timestamp as string),
            created_at: new Date(log.created_at as string),
        }));
    }

    /**
     * Get logs by session ID
     */
    static async getLogsBySession(sessionId: string): Promise<LogEntry[]> {
        const response = await fetch(`${this.BASE_URL}/session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch session logs: ${response.statusText}`);
        }

        const data = await response.json();

        return data.data.map((log: Record<string, unknown>) => ({
            ...log,
            timestamp: new Date(log.timestamp as string),
            created_at: new Date(log.created_at as string),
        }));
    }

    /**
     * Get available log categories
     */
    static async getCategories(): Promise<string[]> {
        const response = await fetch(`${this.BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Get log statistics
     */
    static async getStatistics(): Promise<LogStatistics> {
        const response = await fetch(`${this.BASE_URL}/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch statistics: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            ...data.data,
            oldestLog: data.data.oldestLog ? new Date(data.data.oldestLog) : undefined,
            newestLog: data.data.newestLog ? new Date(data.data.newestLog) : undefined,
        };
    }

    /**
     * Trigger manual cleanup
     */
    static async cleanupLogs(): Promise<LogCleanupResult> {
        const response = await fetch(`${this.BASE_URL}/cleanup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to cleanup logs: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Create a test log (development only)
     */
    static async createTestLog(
        level: LogLevel = 'INFO',
        category: string = 'TEST',
        message: string = 'Test log from frontend'
    ): Promise<void> {
        const response = await fetch(`${this.BASE_URL}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ level, category, message }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create test log: ${response.statusText}`);
        }
    }

    /**
     * Connect to real-time log stream via Server-Sent Events
     */
    static connectToLogStream(
        onLog: (log: LogEntry) => void,
        onError?: (error: string) => void,
        filters?: { level?: LogLevel; category?: string }
    ): EventSource {
        const params = new URLSearchParams();

        if (filters?.level) {
            params.append('level', filters.level);
        }
        if (filters?.category) {
            params.append('category', filters.category);
        }

        const url = `${this.BASE_URL}/stream?${params.toString()}`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const message: LogStreamMessage = JSON.parse(event.data);

                switch (message.type) {
                    case 'connected':
                        console.log('[LOG_STREAM] Connected to log stream');
                        break;

                    case 'log':
                        if (message.data) {
                            // Convert timestamp strings to Date objects
                            const log: LogEntry = {
                                ...message.data,
                                timestamp: new Date(message.data.timestamp),
                                created_at: new Date(message.data.created_at),
                            };
                            onLog(log);
                        }
                        break;

                    case 'keepalive':
                        // Keep connection alive - no action needed
                        break;

                    case 'error':
                        console.error('[LOG_STREAM] Stream error:', message.error);
                        if (onError) {
                            onError(message.error || 'Unknown stream error');
                        }
                        break;
                }
            } catch (error) {
                console.error('[LOG_STREAM] Failed to parse message:', error);
                if (onError) {
                    onError('Failed to parse stream message');
                }
            }
        };

        eventSource.onerror = (error) => {
            console.error('[LOG_STREAM] EventSource error:', error);
            if (onError) {
                onError('Connection to log stream failed');
            }
        };

        return eventSource;
    }

    /**
     * Export logs as text file
     */
    static async exportLogs(
        filters: LogFilters = {},
        format: 'txt' | 'json' = 'txt'
    ): Promise<void> {
        const logs = await this.getLogs(filters);

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'json') {
            content = JSON.stringify(logs, null, 2);
            filename = `logs-export-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            content = logs
                .map(log => {
                    const timestamp = log.timestamp.toLocaleString('pt-BR');
                    const level = log.level.padEnd(7);
                    const category = log.category.padEnd(12);
                    return `${timestamp} [${level}] [${category}] ${log.message}`;
                })
                .join('\\n');
            filename = `logs-export-${new Date().toISOString().split('T')[0]}.txt`;
            mimeType = 'text/plain';
        }

        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /**
     * Format log message with metadata for display
     */
    static formatLogForDisplay(log: LogEntry): string {
        let formatted = log.message;

        if (log.metadata && Object.keys(log.metadata).length > 0) {
            const metadataStr = Object.entries(log.metadata)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(', ');
            formatted += ` [${metadataStr}]`;
        }

        return formatted;
    }

    /**
     * Get log level priority for sorting
     */
    static getLogLevelPriority(level: LogLevel): number {
        const priorities = {
            ERROR: 5,
            WARN: 4,
            SUCCESS: 3,
            INFO: 2,
            DEBUG: 1,
        };
        return priorities[level] || 0;
    }
}
