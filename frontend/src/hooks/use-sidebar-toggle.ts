import { useState, useCallback } from "react";

/**
 * Hook para gerenciar o estado de recolhimento da sidebar
 */
export function useSidebarToggle() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    const collapseSidebar = useCallback(() => {
        setIsCollapsed(true);
    }, []);

    const expandSidebar = useCallback(() => {
        setIsCollapsed(false);
    }, []);

    return {
        isCollapsed,
        toggleSidebar,
        collapseSidebar,
        expandSidebar,
    };
}
