import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion"

interface StoresFilterControlsProps {
    activeFiltersCount: number;
    onToggleExpanded: () => void;
    onClearFilters: () => void;
}

export function StoresFilterControls({
    activeFiltersCount,
    onToggleExpanded,
    onClearFilters
}: StoresFilterControlsProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-2"
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onToggleExpanded}
                    className="flex items-center gap-2"
                >
                    <Filter size={16} />
                    Filtros
                    {activeFiltersCount > 0 && (
                        <Badge variant="default" className="ml-1">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                    >
                        <X size={16} />
                        Limpar
                    </Button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}