import { PageContainer } from "@/components/layout/page-container";
import { PageCard } from "@/components/layout/page-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, TestTube, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notificationChannelsApi } from "@/controllers/notification-channels-api";
import { NotificationChannelType, type NotificationChannelData, type TelegramConfig, type EmailConfig, type WebhookConfig } from "@/types/notification-channel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/stores/auth";
import { isAdmin } from "@/utils/permissions";
import { AnimatedWrapper } from "@/components/animated-wrapper";

export function ChannelDetailsPage() {
    const [channel, setChannel] = useState<NotificationChannelData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTestingChannel, setIsTestingChannel] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    useEffect(() => {
        const loadChannel = async () => {
            if (!id) {
                toast.error("ID do canal não fornecido");
                navigate('/canais-notificacao');
                return;
            }

            try {
                setIsLoading(true);
                const channels = await notificationChannelsApi.list();
                const foundChannel = channels.find(c => c.id === parseInt(id));

                if (!foundChannel) {
                    toast.error("Canal não encontrado");
                    navigate('/canais-notificacao');
                    return;
                }

                setChannel(foundChannel);
            } catch (error) {
                toast.error("Erro ao carregar canal", {
                    description: (error as Error)?.message || "Não foi possível carregar os dados do canal."
                });
                navigate('/canais-notificacao');
            } finally {
                setIsLoading(false);
            }
        };

        loadChannel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTestChannel = async () => {
        if (!channel) return;

        setIsTestingChannel(true);
        try {
            const result = await notificationChannelsApi.test(channel.id);

            if (result.testResult.success) {
                toast.success("Teste realizado com sucesso", {
                    description: `Notificação enviada através do canal "${channel.name}"`
                });
            } else {
                const errorMessage = result.testResult.details?.error || result.testResult.message;
                toast.error("Erro no teste", {
                    description: errorMessage
                });
            }
        } catch {
            toast.error("Erro ao testar canal", {
                description: "Não foi possível realizar o teste do canal."
            });
        } finally {
            setIsTestingChannel(false);
        }
    };

    const handleDeleteChannel = async () => {
        if (!channel) return;

        setIsDeleting(true);
        try {
            await notificationChannelsApi.delete(channel.id);
            toast.success("Canal excluído com sucesso", {
                description: `O canal "${channel.name}" foi removido.`
            });
            navigate('/canais-notificacao');
        } catch (error) {
            toast.error("Erro ao excluir canal", {
                description: (error as Error)?.message || "Não foi possível excluir o canal."
            });
        } finally {
            setIsDeleting(false);
            setDeleteModal(false);
        }
    };

    if (isLoading) {
        return (
            <AnimatedWrapper preset="fadeIn" duration={0.3}>
                <PageContainer
                    title="Carregando..."
                    subtitle="Aguarde enquanto carregamos os dados do canal"
                >
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                </PageContainer>
            </AnimatedWrapper>
        );
    }

    if (!channel) {
        return null;
    }

    const renderChannelConfig = () => {
        switch (channel.type) {
            case NotificationChannelType.TELEGRAM: {
                const telegramConfig = channel.config as TelegramConfig;
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações do Telegram</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Token do Bot</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {telegramConfig.bot_token ? `${telegramConfig.bot_token.substring(0, 10)}...` : 'Não configurado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Chat ID Padrão</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {telegramConfig.chat_id || 'Não configurado'}
                                    </p>
                                </div>
                            </div>

                            {telegramConfig.webhook_url && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">URL do Webhook</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                                        {telegramConfig.webhook_url}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Comandos Interativos</p>
                                <Badge variant={telegramConfig.enable_interactive ? "default" : "secondary"}>
                                    {telegramConfig.enable_interactive ? "Habilitado" : "Desabilitado"}
                                </Badge>
                            </div>

                            {telegramConfig.allowed_users && telegramConfig.allowed_users.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Usuários Permitidos</p>
                                    <div className="space-y-2">
                                        {telegramConfig.allowed_users.map((user) => (
                                            <div key={user.chat_id} className="flex items-center justify-between p-2 border rounded">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-sm text-muted-foreground">Chat ID: {user.chat_id}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            }

            case NotificationChannelType.EMAIL: {
                const emailConfig = channel.config as EmailConfig;
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações do Email</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Servidor SMTP</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {emailConfig.smtp_host || 'Não configurado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Porta SMTP</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {emailConfig.smtp_port || 'Não configurado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Usuário SMTP</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {emailConfig.smtp_user || 'Não configurado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email Remetente</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {emailConfig.from_email || 'Não configurado'}
                                    </p>
                                </div>
                            </div>

                            {emailConfig.from_name && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nome Remetente</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {emailConfig.from_name}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">TLS</p>
                                <Badge variant={emailConfig.use_tls ? "default" : "secondary"}>
                                    {emailConfig.use_tls ? "Habilitado" : "Desabilitado"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                );
            }

            case NotificationChannelType.WEBHOOK: {
                const webhookConfig = channel.config as WebhookConfig;
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações do Webhook</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">URL do Webhook</p>
                                <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                                    {webhookConfig.webhook_url || 'Não configurado'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Método HTTP</p>
                                    <Badge variant="outline">
                                        {webhookConfig.method || 'POST'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Timeout</p>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">
                                        {webhookConfig.timeout || 30000}ms
                                    </p>
                                </div>
                            </div>

                            {webhookConfig.headers && Object.keys(webhookConfig.headers).length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Headers Customizados</p>
                                    <div className="space-y-2">
                                        {Object.entries(webhookConfig.headers).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-2 border rounded">
                                                <span className="font-mono text-sm font-medium">{key}</span>
                                                <span className="font-mono text-sm text-muted-foreground">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            }

            default:
                return (
                    <Card>
                        <CardContent className="py-6">
                            <p className="text-muted-foreground">Tipo de canal não suportado para visualização de detalhes.</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <>
            <PageContainer
                title={channel.name}
                subtitle="Detalhes do canal de notificação"
                breadcrumbs={[
                    { label: "Canais de Notificação", to: "/canais-notificacao" },
                    { label: "Detalhes" }
                ]}
            >
                <div className="space-y-4">
                    {/* Informações Gerais */}
                    <AnimatedWrapper preset="fadeInUp" duration={0.3}>
                        <PageCard cardTitle="Informações Gerais">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                                    <p className="text-lg font-semibold">{channel.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                                    <Badge variant="outline" className="mt-1">
                                        {channel.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={channel.active ? "default" : "secondary"} className="mt-1">
                                        {channel.active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                                    <p className="text-sm">{new Date(channel.created_at).toLocaleString('pt-BR')}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                                    <p className="text-sm">{new Date(channel.updated_at).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        </PageCard>
                    </AnimatedWrapper>

                    {/* Configurações Específicas */}
                    <AnimatedWrapper preset="fadeInUp" duration={0.3} delay={0.1}>
                        {renderChannelConfig()}
                    </AnimatedWrapper>
                </div>
            </PageContainer>

            {/* Botões Flutuantes/Sticky */}
            <AnimatedWrapper preset="fadeIn" duration={0.3}>
                <div className="fixed bottom-6 right-6 z-50 flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => navigate('/canais-notificacao')}
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-shadow"
                        onClick={handleTestChannel}
                        disabled={isTestingChannel}
                    >
                        {isTestingChannel ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                                Testando...
                            </>
                        ) : (
                            <>
                                <TestTube className="h-5 w-5 mr-2" />
                                Testar
                            </>
                        )}
                    </Button>

                    {isAdmin(user) && (
                        <>
                            <Button
                                type="button"
                                variant="default"
                                size="lg"
                                className="shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => navigate(`/canais-notificacao/${channel.id}/editar`)}
                            >
                                <Edit className="h-5 w-5 mr-2" />
                                Editar
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                size="lg"
                                className="shadow-lg hover:shadow-xl transition-shadow"
                                onClick={() => setDeleteModal(true)}
                            >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Excluir
                            </Button>
                        </>
                    )}
                </div>
            </AnimatedWrapper>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o canal "{channel.name}"?
                            Esta ação não pode ser desfeita e o canal será removido permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal(false)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteChannel}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Excluindo...
                                </>
                            ) : (
                                "Excluir Canal"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
