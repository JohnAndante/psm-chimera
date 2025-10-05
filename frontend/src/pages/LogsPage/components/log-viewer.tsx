import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { LogEntry, LogLevel } from '../../../types/log';
import { LOG_LEVEL_CONFIG } from '../../../types/log';

interface LogViewerProps {
    logs: LogEntry[];
    loading?: boolean;
    className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({
    logs,
    loading = false,
    className = ''
}) => {
    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getLevelConfig = (level: LogLevel) => {
        return LOG_LEVEL_CONFIG[level] || LOG_LEVEL_CONFIG.INFO;
    };

    const renderMetadata = (metadata: unknown) => {
        if (!metadata || typeof metadata !== 'object') return null;

        return (
            <div className="mt-2 text-xs text-muted-foreground">
                <details className="cursor-pointer">
                    <summary className="hover:text-foreground">Metadados ({Object.keys(metadata as Record<string, unknown>).length})</summary>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(metadata, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Carregando logs...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (logs.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum log encontrado</p>
                        <p className="text-sm mt-1">Ajuste os filtros ou aguarde novos logs</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                    {logs.map((log) => {
                        const levelConfig = getLevelConfig(log.level as LogLevel);

                        return (
                            <div
                                key={log.id}
                                className={`border-b border-border p-4 hover:bg-muted/50 transition-colors ${levelConfig.bgColor || ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="outline"
                                                className={`${levelConfig.color} ${levelConfig.bgColor} border-current`}
                                            >
                                                {levelConfig.icon && React.createElement(levelConfig.icon, { className: "w-3 h-3 mr-1" })}
                                                {log.level}
                                            </Badge>

                                            {log.category && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {log.category}
                                                </Badge>
                                            )}

                                            {log.session_id && (
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {log.session_id.slice(0, 8)}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="text-sm mb-2">
                                            <p className="font-medium break-words">{log.message}</p>
                                        </div>

                                        {renderMetadata(log.metadata)}
                                    </div>

                                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                                        <time dateTime={log.timestamp.toISOString()}>
                                            {formatTimestamp(log.timestamp.toISOString())}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
