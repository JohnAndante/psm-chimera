import React from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

/**
 * Componente de exemplo que demonstra como usar o toggle da sidebar
 * Este componente pode ser usado em qualquer lugar da aplicação
 */
export function SidebarToggleButton() {
    const { isCollapsed, toggleSidebar } = useSidebarToggle();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="gap-2"
        >
            {isCollapsed ? (
                <>
                    <PanelLeftOpen className="h-4 w-4" />
                    Expandir Sidebar
                </>
            ) : (
                <>
                    <PanelLeftClose className="h-4 w-4" />
                    Recolher Sidebar
                </>
            )}
        </Button>
    );
}
