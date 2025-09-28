import { MessageSquare, Settings, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { AgentViewProps } from "../types"
import { cn } from "@/lib/utils"

// ===========================
// Helper Functions
// ===========================

const getActiveStatus = (active: boolean) => {
    return active ? (
        <Badge className={cn(
            "bg-green-100 text-green-800 hover:bg-green-200",
            "dark:bg-green-900/50 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/70"
        )}>
            Ativo
        </Badge>
    ) : (
        <Badge variant="outline" className={cn(
            "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
            "dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-900/70"
        )}>
            Inativo
        </Badge>
    )
}

// ===========================
// AgentView Component
// ===========================

/**
 * Componente de visualização detalhada de um agente
 * Mostra todas as informações organizadas em cards
 */
export function AgentView({ agent, isLoading = false }: AgentViewProps) {

    // Se estiver carregando ou não tiver agente, mostra skeletons
    if (isLoading || !agent) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card: Informações Básicas - Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Informações Básicas</CardTitle>
                            </div>
                            <CardDescription>
                                Dados fundamentais do agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Skeleton className="h-4 w-12 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Separator />
                            <div>
                                <Skeleton className="h-4 w-12 mb-2" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Configurações - Skeleton */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                <CardTitle>Configurações</CardTitle>
                            </div>
                            <CardDescription>
                                Configurações técnicas do agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                            <Separator />
                            <div>
                                <Skeleton className="h-4 w-8 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Descrição - Skeleton */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Descrição</CardTitle>
                            </div>
                            <CardDescription>
                                Descrição do agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Objetivo - Skeleton */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                <CardTitle>Objetivo</CardTitle>
                            </div>
                            <CardDescription>
                                Propósito e função principal do agente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card: Personalidade - Skeleton */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Personalidade</CardTitle>
                            </div>
                            <CardDescription>
                                Características comportamentais e tom de voz
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Card: Informações Básicas */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Informações Básicas</CardTitle>
                        </div>
                        <CardDescription>
                            Dados fundamentais do agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Nome
                            </label>
                            <p className="text-sm mt-1">{agent.name}</p>
                        </div>

                        <Separator />

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Status
                            </label>
                            <div className="mt-1">
                                {getActiveStatus(agent.active)}
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Card: Configurações */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            <CardTitle>Configurações</CardTitle>
                        </div>
                        <CardDescription>
                            Configurações técnicas do agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Voz Selecionada
                            </label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{agent.voice_name}</span>
                                    <Badge
                                        variant={agent.voice_gender === 'male' ? 'default' : 'secondary'}
                                        className={`text-xs ${agent.voice_gender === 'female'
                                            ? 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700 dark:hover:bg-pink-900/70'
                                            : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-900/70'
                                            }`}
                                    >
                                        {agent.voice_gender === 'male' ? 'Masculino' : 'Feminino'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {agent.voice_gender === 'male'
                                        ? 'Voz masculina para atendimento'
                                        : 'Voz feminina para atendimento'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Descrição */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Descrição</CardTitle>
                        </div>
                        <CardDescription>
                            Descrição do agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {agent.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Objetivo */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            <CardTitle>Objetivo</CardTitle>
                        </div>
                        <CardDescription>
                            Propósito e função principal do agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {agent.objective}
                        </p>
                    </CardContent>
                </Card>

                {/* Card: Personalidade */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Personalidade</CardTitle>
                        </div>
                        <CardDescription>
                            Características comportamentais e tom de voz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {agent.personality}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
