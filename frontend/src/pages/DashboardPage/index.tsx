import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<"hoje" | "7d" | "30d">("hoje")

    const periodButtons = [
        { key: 'hoje', label: 'Hoje' },
        { key: '7d', label: '7 dias' },
        { key: '30d', label: '30 dias' }
    ] as const

    const headerActions = (
        <div className="flex items-center gap-2">
            {periodButtons.map(period => (
                <Button
                    key={period.key}
                    variant="ghost"
                    onClick={() => setSelectedPeriod(period.key as "hoje" | "7d" | "30d")}
                    className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium cursor-pointer border border-input",
                        selectedPeriod === period.key
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary/80"
                            : "bg-transparent text-muted-foreground border-input hover:bg-primary/8 hover:text-foreground hover:border-primary/40"
                    )}
                >
                    {period.label}
                </Button>
            ))}
        </div>
    )

    return (
        <PageContainer
            title="Dashboard"
            subtitle="Visão geral do desempenho do sistema"
            breadcrumbs={[
                { label: "Dashboard", to: "/" },
            ]}
            extra={headerActions}
        >
            <div>
                <h2 className="text-lg font-medium">Tela Inicial</h2>
                <p className="text-sm text-muted-foreground">
                    Bem-vindo ao Painel de Controle.
                    <br />
                    Aqui você pode gerenciar as funcionalidades do sistema de forma eficiente.
                </p>

                <Separator className="my-4" />
            </div>
        </PageContainer>
    )
}
