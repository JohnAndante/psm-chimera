import { useEffect } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Calendar, Loader2 } from "lucide-react"
import { useRotinas } from "./hooks"
import { RoutineList, RoutineForm, RoutineView } from "./components"

// ===========================
// RotinasPage Component
// ===========================

/**
 * Página principal de gerenciamento de rotinas
 * Coordena entre diferentes visualizações: listagem, criação, visualização e edição
 */
export default function RotinasPage() {
    const {
        // Navigation
        mode,
        goToList,
        goToCreate,
        goToView,
        goToEdit,

        // Data
        rotinas,
        isLoading,
        refreshRotinas,
        currentRoutine
    } = useRotinas()

    // Refresh na montagem
    useEffect(() => {
        if (mode === 'list') {
            refreshRotinas()
        }
    }, [mode, refreshRotinas])


    // Gerar breadcrumbs dinamicamente baseado no modo
    const getBreadcrumbs = () => {
        const base = [{ label: "Dashboard", to: "/" }]

        if (mode === 'list') {
            return [...base, { label: "Rotinas" }]
        }

        if (mode === 'create') {
            return [
                ...base,
                { label: "Rotinas", to: "/rotinas" },
                { label: "Nova Rotina" }
            ]
        }

        if (mode === 'view' && currentRoutine) {
            return [
                ...base,
                { label: "Rotinas", to: "/rotinas" },
                { label: currentRoutine.name }
            ]
        }

        if (mode === 'edit' && currentRoutine) {
            return [
                ...base,
                { label: "Rotinas", to: "/rotinas" },
                { label: currentRoutine.name, to: `/rotinas/${currentRoutine.id}` },
                { label: "Editar" }
            ]
        }

        return base
    }

    // Informações da página baseadas no modo
    const getPageInfo = () => {
        switch (mode) {
            case 'list':
                return {
                    title: "Rotinas",
                    subtitle: "Gerencie as rotinas automatizadas da sua empresa"
                }
            case 'create':
                return {
                    title: "Nova Rotina",
                    subtitle: "Configure uma nova rotina de automação"
                }
            case 'view':
                return {
                    title: "Detalhes da Rotina",
                    subtitle: "Visualizar detalhes e configurações da rotina"
                }
            case 'edit':
                return {
                    title: "Editar Rotina",
                    subtitle: `Modificar configurações de ${currentRoutine?.name || "rotina"}`
                }
            default:
                return {
                    title: "Rotinas",
                    subtitle: "Gerencie as rotinas da sua empresa"
                }
        }
    }

    // Botões extra baseados no modo
    const getPageExtra = () => {
        if (mode === 'list') {
            return (
                <Button onClick={goToCreate} className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Rotina
                </Button>
            )
        }

        if (mode === 'view' && currentRoutine) {
            return (
                <Button onClick={() => goToEdit(currentRoutine.id)} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Rotina
                </Button>
            )
        }

        return null
    }

    const pageInfo = getPageInfo()

    // Renderização condicional baseada no modo
    if (mode === 'list') {
        return (
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
                extra={getPageExtra()}
            >
                <RoutineList
                    rotinas={rotinas}
                    isLoading={isLoading}
                    onView={goToView}
                    onEdit={(routine) => goToEdit(routine.id)}
                />
            </PageContainer>
        )
    }

    if (mode === 'create') {
        return (
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
            >
                <RoutineForm onSuccess={() => goToList()} />
            </PageContainer>
        )
    }

    if (mode === 'view') {
        if (isLoading) {
            return (
                <PageContainer
                    title="Carregando..."
                    subtitle="Obtendo detalhes da rotina"
                    breadcrumbs={getBreadcrumbs()}
                >
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Carregando rotina...</span>
                    </div>
                </PageContainer>
            )
        }

        if (!currentRoutine) {
            return (
                <PageContainer
                    title="Rotina não encontrada"
                    subtitle="A rotina solicitada não foi encontrada"
                    breadcrumbs={getBreadcrumbs()}
                >
                    <div className="text-center p-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p>Rotina não encontrada ou foi removida.</p>
                        <Button onClick={goToList} className="mt-4">
                            Voltar para listagem
                        </Button>
                    </div>
                </PageContainer>
            )
        }

        return (
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
                extra={getPageExtra()}
            >
                <RoutineView routine={currentRoutine} isLoading={isLoading} />
            </PageContainer>
        )
    }

    if (mode === 'edit') {
        if (isLoading) {
            return (
                <PageContainer
                    title="Carregando..."
                    subtitle="Obtendo dados da rotina para edição"
                    breadcrumbs={getBreadcrumbs()}
                >
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Carregando rotina...</span>
                    </div>
                </PageContainer>
            )
        }

        if (!currentRoutine) {
            return (
                <PageContainer
                    title="Rotina não encontrada"
                    subtitle="A rotina solicitada não foi encontrada para edição"
                    breadcrumbs={getBreadcrumbs()}
                >
                    <div className="text-center p-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p>Rotina não encontrada ou foi removida.</p>
                        <Button onClick={goToList} className="mt-4">
                            Voltar para listagem
                        </Button>
                    </div>
                </PageContainer>
            )
        }

        return (
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
            >
                <RoutineForm
                    routine={currentRoutine}
                    onSuccess={() => goToView(currentRoutine.id)}
                />
            </PageContainer>
        )
    }

    // Fallback
    return null
}
