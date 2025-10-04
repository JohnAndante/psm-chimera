import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StoresFilterState } from "../types";
import { Form, FormItem, FormField, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion";

interface StoresActiveFiltersProps {
    filters: StoresFilterState;
    onFilterChange: (key: keyof StoresFilterState, value: string) => void;
    onApplyFilters: () => void;
    onRemoveFilter: (key: keyof StoresFilterState, value: string) => void;
    isExpanded: boolean;
    isLoading?: boolean;
}

export function StoresActiveFilters({
    filters,
    onFilterChange,
    onApplyFilters,
    onRemoveFilter,
    isExpanded,
    isLoading = false
}: StoresActiveFiltersProps) {

    const form = useForm({
        defaultValues: {
            name: filters.name,
            registration: filters.registration,
            active: filters.active
        }
    });


    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.name) count++;
        if (filters.registration) count++;
        if (filters.active !== "ALL") count++;
        return count;
    };

    const getActiveLabel = (active: string) => {
        const labels = {
            ALL: "Todos",
            true: "Ativa",
            false: "Inativa"
        };
        return labels[active as keyof typeof labels] || active;
    };

    const activeFiltersCount = getActiveFiltersCount();

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilters();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Form {...form}>
                <form onSubmit={submitFilters}>
                    <div className="space-y-4 mb-4">
                        {/* Filtros aplicados como badges */}
                        <AnimatePresence>
                            {activeFiltersCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-wrap gap-2"
                                >
                                    <AnimatePresence>
                                        {filters.name && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Nome: {filters.name}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                                        onClick={() => onRemoveFilter("name", "")}
                                                    >
                                                        <X size={12} />
                                                    </Button>
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <AnimatePresence>
                                        {filters.registration && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Registro: {filters.registration}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                                        onClick={() => onRemoveFilter("registration", "")}
                                                    >
                                                        <X size={12} />
                                                    </Button>
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <AnimatePresence>
                                        {filters.active !== "ALL" && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    Status: {getActiveLabel(filters.active)}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                                        onClick={() => onRemoveFilter("active", "ALL")}
                                                    >
                                                        <X size={12} />
                                                    </Button>
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Campos de filtro expandidos */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="name-filter">Nome da Loja</Label>
                                                <FormControl>
                                                    <Input
                                                        id="name-filter"
                                                        placeholder="Buscar por nome..."
                                                        value={filters.name}
                                                        onChange={(e) => {
                                                            onFilterChange("name", e.target.value);
                                                            field.onChange(e);
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="registration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label htmlFor="registration-filter">Registro</Label>
                                                <FormControl>
                                                    <Input
                                                        id="registration-filter"
                                                        placeholder="Buscar por registro..."
                                                        value={filters.registration}
                                                        onChange={(e) => {
                                                            onFilterChange("registration", e.target.value);
                                                            field.onChange(e);
                                                        }}
                                                    />
                                                </FormControl>
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
                                                    value={filters.active}
                                                    onValueChange={(value) => {
                                                        onFilterChange("active", value);
                                                        field.onChange(value);
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger id="active-filter">
                                                            <SelectValue placeholder="Selecionar status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ALL">Todos</SelectItem>
                                                        <SelectItem value="true">Ativa</SelectItem>
                                                        <SelectItem value="false">Inativa</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Botão de aplicar filtros */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full md:w-auto"
                                >
                                    {isLoading ? "Aplicando..." : "Aplicar Filtros"}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </Form>
        </motion.div>
    );
}