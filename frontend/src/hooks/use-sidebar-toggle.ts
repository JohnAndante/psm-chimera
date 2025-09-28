import { useState, useCallback } from "react";

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Hook para gerenciar o estado de recolhimento da sidebar com persistência
 */
export function useSidebarToggle(defaultOpen = true) {
    // Inicializa o estado com base no cookie ou valor padrão
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === "undefined") return !defaultOpen;

        const savedState = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
            ?.split('=')[1];

        return savedState ? savedState === 'false' : !defaultOpen;
    });

    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => {
            const newState = !prev;
            // Salva no cookie
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${!newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
            return newState;
        });
    }, []);

    const collapseSidebar = useCallback(() => {
        setIsCollapsed(true);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=false; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }, []);

    const expandSidebar = useCallback(() => {
        setIsCollapsed(false);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=true; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }, []);

    return {
        isCollapsed,
        isOpen: !isCollapsed,
        state: isCollapsed ? "collapsed" : "expanded" as "collapsed" | "expanded",
        toggleSidebar,
        collapseSidebar,
        expandSidebar,
    };
}
