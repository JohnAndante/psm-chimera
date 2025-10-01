import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { BarChart3, Clock, Database, Activity } from 'lucide-react';
import type { LogStatistics, LogLevel } from '../../../types/log';
import { LOG_LEVEL_CONFIG, LOG_CATEGORY_CONFIG } from '../../../types/log';

interface LogStatisticsCardProps {
    statistics: LogStatistics | null;
    loading?: boolean;
    className?: string;
}

export const LogStatisticsCard: React.FC<LogStatisticsCardProps> = ({
    statistics,
    loading = false,
    className = ''
}) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLevelConfig = (level: LogLevel) => {
        return LOG_LEVEL_CONFIG[level] || LOG_LEVEL_CONFIG.INFO;
    };

    const getCategoryColor = (category: string) => {
        return LOG_CATEGORY_CONFIG[category as keyof typeof LOG_CATEGORY_CONFIG]?.color || 'text-gray-600';
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Estatísticas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!statistics) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Estatísticas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Sem dados disponíveis</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const topCategories = Object.entries(statistics.logsByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const mostCommonLevel = Object.entries(statistics.logsByLevel)
        .sort(([, a], [, b]) => b - a)[0];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Visão Geral
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                                {statistics.totalLogs.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-sm text-muted-foreground">Total de Logs</div>
                        </div>

                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                                {statistics.recentSessions.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Sessões Ativas</div>
                        </div>
                    </div>

                    {mostCommonLevel && (
                        <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Nível mais comum</div>
                            <Badge className={getLevelConfig(mostCommonLevel[0] as LogLevel).color}>
                                {mostCommonLevel[0]} ({mostCommonLevel[1]} logs)
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs by Level */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Por Nível
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(statistics.logsByLevel)
                            .sort(([, a], [, b]) => b - a)
                            .map(([level, count]) => {
                                const levelConfig = getLevelConfig(level as LogLevel);
                                const percentage = (count / statistics.totalLogs) * 100;

                                return (
                                    <div key={level} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`${levelConfig.color} ${levelConfig.bgColor} border-current`}
                                                >
                                                    {level}
                                                </Badge>
                                            </div>
                                            <span className="font-medium">
                                                {count.toLocaleString('pt-BR')} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Top Categorias
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topCategories.map(([category, count]) => {
                            const percentage = (count / statistics.totalLogs) * 100;
                            const color = getCategoryColor(category);

                            return (
                                <div key={category} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={color}>
                                                {category}
                                            </Badge>
                                        </div>
                                        <span className="font-medium">
                                            {count.toLocaleString('pt-BR')} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            {(statistics.oldestLog || statistics.newestLog) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Período
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {statistics.oldestLog && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Log mais antigo:</span>
                                <time className="font-medium" dateTime={statistics.oldestLog.toISOString()}>
                                    {formatDate(statistics.oldestLog)}
                                </time>
                            </div>
                        )}

                        {statistics.newestLog && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Log mais recente:</span>
                                <time className="font-medium" dateTime={statistics.newestLog.toISOString()}>
                                    {formatDate(statistics.newestLog)}
                                </time>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recent Sessions */}
            {statistics.recentSessions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Sessões Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {statistics.recentSessions.slice(0, 10).map((sessionId) => (
                                <Badge key={sessionId} variant="outline" className="font-mono text-xs">
                                    {sessionId.slice(0, 8)}...
                                </Badge>
                            ))}
                            {statistics.recentSessions.length > 10 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{statistics.recentSessions.length - 10} mais
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
