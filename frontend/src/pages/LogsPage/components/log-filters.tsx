import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { LogFilters as LogFiltersType, LogLevel } from '../../../types/log';
import { LOG_LEVEL_CONFIG, LOG_CATEGORY_CONFIG } from '../../../types/log';

interface LogFiltersComponentProps {
    filters: LogFiltersType;
    onFiltersChange: (filters: LogFiltersType) => void;
    /** categorias disponíveis para filtro (opcional) */
    /** função opcional para limpar todos os filtros */
    onClear?: () => void;
    className?: string;
}

export const LogFilters: React.FC<LogFiltersComponentProps> = ({
    filters,
    onFiltersChange,
    onClear,
    className = ''
}) => {
    const handleFilterChange = (key: keyof LogFiltersType, value: unknown) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const handleLevelSelect = (level: LogLevel) => {
        const isSelected = filters.level === level;
        handleFilterChange('level', isSelected ? undefined : level);
    };

    const handleCategorySelect = (category: string) => {
        const isSelected = filters.category === category;
        handleFilterChange('category', isSelected ? undefined : category);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
        if (onClear) onClear();
    };

    const hasActiveFilters = Object.keys(filters).some(key => {
        const value = filters[key as keyof LogFiltersType];
        return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
    });

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs"
                        >
                            <X className="w-3 h-3 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Busca por texto */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar na mensagem</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Digite para buscar..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Filtro por nível */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nível de Log</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(LOG_LEVEL_CONFIG).map(([level, config]) => {
                            const isSelected = filters.level === level;

                            return (
                                <Badge
                                    key={level}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors ${isSelected ? config.color : 'hover:bg-muted'
                                        }`}
                                    onClick={() => handleLevelSelect(level as LogLevel)}
                                >
                                    {level}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Filtro por categoria */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(LOG_CATEGORY_CONFIG).map(([category, config]) => {
                            const isSelected = filters.category === category;

                            return (
                                <Badge
                                    key={category}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors ${isSelected ? config.color : 'hover:bg-muted'
                                        }`}
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    {category}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Filtro por sessão */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">ID da Sessão</label>
                    <Input
                        placeholder="Digite o ID da sessão..."
                        value={filters.sessionId || ''}
                        onChange={(e) => handleFilterChange('sessionId', e.target.value || undefined)}
                        className="font-mono text-sm"
                    />
                </div>

                {/* Filtro por período */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            De
                        </label>
                        <Input
                            type="datetime-local"
                            value={filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                            className="text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Até
                        </label>
                        <Input
                            type="datetime-local"
                            value={filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Resumo dos filtros ativos */}
                {hasActiveFilters && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Filtros ativos:</p>
                        <div className="flex flex-wrap gap-1">
                            {filters.search && (
                                <Badge variant="secondary" className="text-xs">
                                    Busca: "{filters.search}"
                                </Badge>
                            )}
                            {filters.level && (
                                <Badge variant="secondary" className="text-xs">
                                    {filters.level}
                                </Badge>
                            )}
                            {filters.category && (
                                <Badge variant="secondary" className="text-xs">
                                    {filters.category}
                                </Badge>
                            )}
                            {filters.sessionId && (
                                <Badge variant="secondary" className="text-xs font-mono">
                                    Sessão: {filters.sessionId.slice(0, 8)}...
                                </Badge>
                            )}
                            {(filters.startDate || filters.endDate) && (
                                <Badge variant="secondary" className="text-xs">
                                    Período
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
