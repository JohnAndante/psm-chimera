import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UsersFilterState } from "../types";
import { Form, FormItem, FormField, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form"

interface UsersActiveFiltersProps {
    filters: UsersFilterState;
    onFilterChange: (key: keyof UsersFilterState, value: string) => void;
    onApplyFilters: () => void;
    onRemoveFilter: (key: keyof UsersFilterState, value: string) => void;
    isExpanded: boolean;
    isLoading?: boolean;
}

export function UsersActiveFilters({
    filters,
    onFilterChange,
    onApplyFilters,
    onRemoveFilter,
    isExpanded,
    isLoading = false
}: UsersActiveFiltersProps) {
    const form = useForm({
        defaultValues: {
            search: filters.search,
            role: filters.role,
            active: filters.active
        }
    });


    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.role !== "ALL") count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

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

    const activeFiltersCount = getActiveFiltersCount();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilters();
    };

    return (
        <Form {...form}>
            <form onSubmit={submitFilters}>
                <div className="space-y-4 mb-4">
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
                                        onClick={() => onRemoveFilter("search", "")}
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
                                        onClick={() => onRemoveFilter("role", "ALL")}
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
                                        onClick={() => onRemoveFilter("active", "ALL")}
                                    >
                                        <X size={12} />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Formulário de filtros */}
                    {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg border">
                            <FormField
                                control={form.control}
                                name="search"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="search-filter">Buscar</Label>
                                        <FormControl>
                                            <Input
                                                id="search-filter"
                                                placeholder="Buscar por nome ou email..."
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    onFilterChange("search", e.target.value);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        onApplyFilters();
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="role-filter">Cargo</Label>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                onFilterChange("role", value);
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger id="role-filter" className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ALL">Todos</SelectItem>
                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                                <SelectItem value="USER">Usuário</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="active-filter">Status</Label>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                onFilterChange("active", value);
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger id="active-filter" className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ALL">Todos</SelectItem>
                                                <SelectItem value="true">Ativo</SelectItem>
                                                <SelectItem value="false">Inativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {/* Botão de submit */}
                            <FormItem>
                                <Label className="invisible">Aplicar Filtros</Label>
                                <Button type="submit" variant="default" className="w-full" loading={isLoading}>
                                    Aplicar Filtros
                                </Button>
                            </FormItem>
                        </div>
                    )}
                </div>
            </form>
        </Form>
    );
}
