import { PageCard } from "@/components/layout/page-card";
import type { AgentsListProps } from "@/pages/AgentesPage/types";

export function UsersList({
    users,
    isLoading,
    onView,
    onEdit,
    onDelete,
}: AgentsListProps) {

    return (
        <PageCard cardTitle="Lista de Usuários">
            <div className="text-center text-muted-foreground">
                Página de Usuários em construção...
            </div>
        </PageCard>
    )
}
