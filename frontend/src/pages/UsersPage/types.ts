export interface UsersFilterProps {
    onFilterChange: (filters: UsersFilterState) => void;
    onClearFilters: () => void;
}

export interface UsersFilterState {
    name: string;
    role: "ALL" | "ADMIN" | "USER";
    active: "ALL" | "true" | "false";
}

export interface UsersApiFilters {
    name?: string;
    role?: "ADMIN" | "USER";
    active?: boolean;
}
