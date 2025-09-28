export interface UsersFilterProps {
    onFilterChange: (filters: UsersFilterState) => void;
    onClearFilters: () => void;
}

export interface UsersFilterState {
    search: string;
    role: "ALL" | "ADMIN" | "USER";
    active: "ALL" | "true" | "false";
}

export interface UsersApiFilters {
    search?: string;
    role?: "ADMIN" | "USER";
    active?: boolean;
}
