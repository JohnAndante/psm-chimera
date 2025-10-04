import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UsersFilterState } from "../types";
import { Form, FormItem, FormField, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion";

interface UserListFiltersProps {
    filters: UsersFilterState;
    onApplyFilters: (values: UsersFilterState) => void;
    isExpanded: boolean;
    isLoading?: boolean;
}

export function UserListFilters({
    filters,
    onApplyFilters,
    isExpanded,
    isLoading = false
}: UserListFiltersProps) {

    const form = useForm({
        defaultValues: {
            name: filters.name,
            role: filters.role,
            active: filters.active
        }
    });

    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const values = form.getValues();
        if (isLoading) return;
        onApplyFilters(values);
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
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg border">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Label htmlFor="name-filter">Nome</Label>
                                                    <FormControl>
                                                        <Input
                                                            id="name-filter"
                                                            placeholder="Buscar por nome"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    submitFilters(e);
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
                                            <Button type="submit" variant="default" className="min-w-fit max-md:w-full" loading={isLoading}>
                                                Aplicar Filtros
                                            </Button>
                                        </FormItem>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </Form>
        </motion.div>
    );
}
