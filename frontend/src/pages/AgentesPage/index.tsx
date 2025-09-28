import { PageContainer } from "@/components/layout/page-container"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"

// Imports locais
import { useAgentes } from "./hooks"
import { AgentsList, AgentForm, AgentView } from "./components"

// ===========================
// Main AgentesPage Component
// ===========================

/**
 * Página principal de Agentes com roteamento interno
 * Coordena entre listagem, cadastro, visualização e edição
 */
export default function AgentesPage() {
    const {
        // Navigation
        mode,
        agentId,
        goToList,
        goToCreate,
        goToView,
        goToEdit,

        // Data
        agentes,
        isLoading,
        error,
        refreshAgents,
        currentAgent
    } = useAgentes()

    // Determina breadcrumbs baseado no modo atual
    const getBreadcrumbs = () => {
        const base = [{ label: "Dashboard", to: "/" }]

        switch (mode) {
            case 'create':
                return [
                    ...base,
                    { label: "Agentes", to: "/agentes" },
                    { label: "Novo Agente" }
                ]
            case 'view':
                return [
                    ...base,
                    { label: "Agentes", to: "/agentes" },
                    { label: currentAgent?.name || 'Visualizar' }
                ]
            case 'edit':
                return [
                    ...base,
                    { label: "Agentes", to: "/agentes" },
                    { label: currentAgent?.name || 'Agente', to: `/agentes/${agentId}` },
                    { label: "Editar" }
                ]
            default:
                return [...base, { label: "Agentes" }]
        }
    }

    // Títulos e subtítulos por modo
    const getPageInfo = () => {
        switch (mode) {
            case 'create':
                return {
                    title: "Novo Agente",
                    subtitle: "Criar um novo agente de IA para atendimento por voz"
                }
            case 'view':
                return {
                    title: "Detalhes do Agente",
                    subtitle: "Visualizar detalhes e configurações do agente"
                }
            case 'edit':
                return {
                    title: "Editar Agente",
                    subtitle: `Modificar configurações de ${currentAgent?.name || 'agente'}`
                }
            default:
                return {
                    title: "Agentes",
                    subtitle: "Gerenciar agentes de IA para atendimento por voz"
                }
        }
    }

    const pageInfo = getPageInfo()

    // Determina conteúdo extra baseado no modo
    const getPageExtra = () => {
        switch (mode) {
            case 'list':
                return (
                    <Button onClick={goToCreate} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Agente
                    </Button>
                )
            case 'view':
                return currentAgent ? (
                    <Button onClick={() => goToEdit(currentAgent.id)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Agente
                    </Button>
                ) : null
            default:
                return null
        }
    }

    // Handler para salvar agente (cadastro/edição)
    const handleSaveAgent = () => {
        refreshAgents()
        goToList()
    }

    // Se agente não encontrado na view/edit e não está carregando, mostra loading
    if ((mode === 'view' || mode === 'edit') && !currentAgent && !isLoading) {
        return (
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            Agente não encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            O agente solicitado não foi encontrado.
                        </p>
                        <Button onClick={goToList} variant="outline">
                            Voltar para lista
                        </Button>
                    </div>
                </div>
            </PageContainer>
        )
    }

    return (
        <>
            <PageContainer
                title={pageInfo.title}
                subtitle={pageInfo.subtitle}
                breadcrumbs={getBreadcrumbs()}
                extra={getPageExtra()}
            >
                {/* Renderização condicional baseada no modo */}
                {mode === 'list' && (
                    <AgentsList
                        agentes={agentes}
                        isLoading={isLoading}
                        onView={goToView}
                        onEdit={(agent) => goToEdit(agent.id)}
                    />
                )}

                {mode === 'create' && (
                    <AgentForm
                        onSave={handleSaveAgent}
                        onCancel={goToList}
                        isLoading={isLoading}
                    />
                )}

                {mode === 'view' && (
                    <AgentView
                        agent={currentAgent}
                        isLoading={isLoading}
                    />
                )}

                {mode === 'edit' && (
                    <>
                        {!currentAgent && isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                        Carregando dados do agente...
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Aguarde enquanto buscamos as informações
                                    </p>
                                </div>
                            </div>
                        ) : currentAgent ? (
                            <AgentForm
                                agent={currentAgent}
                                onSave={handleSaveAgent}
                                onCancel={goToList}
                                title={`Editar ${currentAgent.name}`}
                                isLoading={false}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                        Agente não encontrado
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        O agente solicitado não foi encontrado.
                                    </p>
                                    <Button onClick={goToList} variant="outline">
                                        Voltar para lista
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Mensagem de erro */}
                {error && (
                    <div className="rounded-md bg-destructive/15 p-4">
                        <h3 className="text-sm font-medium text-destructive mb-2">
                            Erro ao carregar agentes
                        </h3>
                        <p className="text-sm text-destructive/90">{error}</p>
                    </div>
                )}
            </PageContainer>
        </>
    )
}
