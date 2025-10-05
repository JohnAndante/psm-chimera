import { useForm, type DefaultValues } from "react-hook-form";
import { motion } from "framer-motion";
import { Form, FormItem } from "../ui/form";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface FilterFieldsProps<T> {
    filters: Partial<T>;
    onFilterChange: (values: T) => void;
    isExpanded: boolean;
    isLoading?: boolean;
    filterFields: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FilterFields<T extends Record<string, any>>({
    filters,
    onFilterChange,
    isExpanded,
    isLoading = false,
    filterFields,
}: FilterFieldsProps<T>) {

    const form = useForm<T>({
        defaultValues: filters as DefaultValues<T>
    });
    const submitFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const values = form.getValues();
        if (isLoading) return;
        onFilterChange(values);
    };

    return (
        <motion.div
            animate={{
                height: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0
            }}
            transition={{
                duration: 0.3,
                ease: "easeInOut"
            }}
            style={{ overflow: "hidden" }}
        >
            <Form {...form}>
                <form onSubmit={submitFilters}
                    className={cn(
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                        "gap-4 p-4 mb-4 rounded-lg border overflow-hidden"
                    )}
                >
                    {filterFields}

                    {/* Botão de submit */}
                    <FormItem>
                        <Label className="invisible">Aplicar Filtros</Label>
                        <Button
                            type="submit"
                            variant="default"
                            className="min-w-fit max-md:w-full"
                            loading={isLoading}
                        >
                            Aplicar Filtros
                        </Button>
                    </FormItem>
                </form>
            </Form>
        </motion.div>
    );
}
