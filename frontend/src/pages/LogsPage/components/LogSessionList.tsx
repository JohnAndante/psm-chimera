import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Clock, Activity, Filter } from 'lucide-react';

interface LogSession {
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    logCount: number;
    categories: string[];
    levels: string[];
    lastActivity: Date;
}

interface LogSessionListProps {
    sessions: LogSession[];
    loading?: boolean;
    onSessionSelect: (sessionId: string) => void;
    selectedSessionId?: string;
    className?: string;
}

export const LogSessionList: React.FC<LogSessionListProps> = ({
    sessions,
    loading = false,
    onSessionSelect,
    selectedSessionId,
    className = ''
}) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (start: Date, end?: Date) => {
        const endTime = end || new Date();
        const diffMs = endTime.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
            return `${diffMins}m`;
        }

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    const isSessionActive = (session: LogSession) => {
        if (!session.endTime) return true;
        const timeSinceEnd = Date.now() - session.endTime.getTime();
        return timeSinceEnd < 5 * 60 * 1000; // 5 minutes
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Sessões
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Carregando sessões...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (sessions.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Sessões
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma sessão encontrada</p>
                        <p className="text-sm mt-1">As sessões aparecerão aqui quando houver atividade</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Sessões ({sessions.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="max-h-[600px] overflow-y-auto space-y-3">
                    {sessions.map((session) => {
                        const isSelected = selectedSessionId === session.sessionId;
                        const isActive = isSessionActive(session);

                        return (
                            <div
                                key={session.sessionId}
                                className={`p-4 rounded-lg border transition-colors cursor-pointer ${isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:bg-muted/50'
                                    }`}
                                onClick={() => onSessionSelect(session.sessionId)}
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`font-mono text-xs ${isSelected ? 'border-primary' : ''}`}
                                            >
                                                {session.sessionId.slice(0, 8)}...
                                            </Badge>

                                            {isActive && (
                                                <Badge variant="default" className="text-xs bg-green-600">
                                                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                                                    Ativa
                                                </Badge>
                                            )}
                                        </div>

                                        <Button
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSessionSelect(session.sessionId);
                                            }}
                                        >
                                            <Filter className="w-3 h-3 mr-1" />
                                            Filtrar
                                        </Button>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Logs</div>
                                            <div className="font-medium">
                                                {session.logCount.toLocaleString('pt-BR')}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-muted-foreground">Duração</div>
                                            <div className="font-medium">
                                                {formatDuration(session.startTime, session.endTime)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {session.categories.length > 0 && (
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Categorias:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {session.categories.slice(0, 4).map((category) => (
                                                    <Badge key={category} variant="secondary" className="text-xs">
                                                        {category}
                                                    </Badge>
                                                ))}
                                                {session.categories.length > 4 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{session.categories.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Levels */}
                                    {session.levels.length > 0 && (
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Níveis:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {session.levels.slice(0, 4).map((level) => (
                                                    <Badge key={level} variant="outline" className="text-xs">
                                                        {level}
                                                    </Badge>
                                                ))}
                                                {session.levels.length > 4 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{session.levels.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Início: {formatDate(session.startTime)}
                                        </div>

                                        {session.endTime && (
                                            <div className="flex items-center gap-1">
                                                Fim: {formatDate(session.endTime)}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1">
                                            Atividade: {formatDate(session.lastActivity)}
                                        </div>
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
