export interface StoresFilterProps {
    onFilterChange: (filters: StoresFilterState) => void;
    onClearFilters: () => void;
}

export interface StoresFilterState {
    name: string;
    registration: string;
    active: "ALL" | "true" | "false";
}

export interface StoresApiFilters {
    name?: string;
    registration?: string;
    active?: boolean;
}
