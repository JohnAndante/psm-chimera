import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UsersFilterProps, UsersFilterState } from "../types";
import { PageCard } from "@/components/layout/page-card";

const initialFilters: UsersFilterState = {
    search: "",
    role: "ALL",
    active: "ALL"
};

export function UsersFilter({ onFilterChange, onClearFilters }: UsersFilterProps) {
    const [filters, setFilters] = useState<UsersFilterState>(initialFilters);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key: keyof UsersFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        onClearFilters();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.role !== "ALL") count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    const getRoleLabel = (role: string) => {
        const labels = {
            ALL: "Todos",
            ADMIN: "Administrador",
            USER: "Usuário"
        };
        return labels[role as keyof typeof labels] || role;
    };

    const getActiveLabel = (active: string) => {
        const labels = {
            ALL: "Todos",
            true: "Ativo",
            false: "Inativo"
        };
        return labels[active as keyof typeof labels] || active;
    };

    return (
        <PageCard cardTitle="Filtros" cardExtra={(
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                >
                    <Filter size={16} />
                    Filtros
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                    >
                        <X size={16} />
                        Limpar
                    </Button>
                )}
            </div>
        )}>
            <div className="space-y-4">
                {/* Filtros aplicados como badges */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {filters.search && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                Busca: {filters.search}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleFilterChange("search", "")}
                                >
                                    <X size={12} />
                                </Button>
                            </Badge>
                        )}
                        {filters.role !== "ALL" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                Cargo: {getRoleLabel(filters.role)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleFilterChange("role", "ALL")}
                                >
                                    <X size={12} />
                                </Button>
                            </Badge>
                        )}
                        {filters.active !== "ALL" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                Status: {getActiveLabel(filters.active)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleFilterChange("active", "ALL")}
                                >
                                    <X size={12} />
                                </Button>
                            </Badge>
                        )}
                    </div>
                )}

                {/* Formulário de filtros */}
                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                            <Label htmlFor="name-filter">Nome</Label>
                            <Input
                                id="name-filter"
                                placeholder="Filtrar por nome..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role-filter">Cargo</Label>
                            <Select
                                value={filters.role}
                                onValueChange={(value) => handleFilterChange("role", value)}
                            >
                                <SelectTrigger id="role-filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="USER">Usuário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="active-filter">Status</Label>
                            <Select
                                value={filters.active}
                                onValueChange={(value) => handleFilterChange("active", value)}
                            >
                                <SelectTrigger id="active-filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="true">Ativo</SelectItem>
                                    <SelectItem value="false">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>
        </PageCard>
    );
}
