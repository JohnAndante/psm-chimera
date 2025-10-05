import { motion, AnimatePresence } from "framer-motion"
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterControlsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentFilters: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultFilters: Record<string, any>;

    onToggleExpanded: () => void;
    onClearFilters: () => void;
}

export function FilterControls({
    currentFilters,
    defaultFilters,
    onToggleExpanded,
    onClearFilters
}: FilterControlsProps) {
    // Compara o currentFilters com defaultFilters para contar os filtros ativos
    const activeFiltersCount = Object.keys(currentFilters).reduce((count, key) => {
        if (currentFilters[key] !== defaultFilters[key]) {
            return count + 1;
        }
        return count;
    }, 0);

    return (
        <div className="flex items-center mb-2">
            <motion.div
                animate={{ marginRight: activeFiltersCount > 0 ? 8 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onToggleExpanded}
                    className="flex items-center gap-2 overflow-hidden"
                >
                    <Filter size={16} />
                    Filtros
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                            opacity: activeFiltersCount > 0 ? 1 : 0,
                            width: activeFiltersCount > 0 ? "auto" : 0,
                            scale: activeFiltersCount > 0 ? 1.1 : 1,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeInOut"
                        }}
                    >
                        {activeFiltersCount > 0 && (
                            <Badge variant="default" className="ml-1">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </motion.div>
                </Button>
            </motion.div>

            <AnimatePresence>
                {activeFiltersCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                        >
                            <X size={16} />
                            Limpar
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
