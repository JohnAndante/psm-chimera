import type { NotificationChannelType } from "@/types/notification-channel";

// Estado dos filtros na UI
export interface NotificationChannelFilterState {
    search: string;
    type: "ALL" | NotificationChannelType;
    active: "ALL" | "true" | "false";
}

// Filtros para API
export interface NotificationChannelApiFilters {
    search?: string;
    type?: NotificationChannelType;
    active?: boolean;
}
