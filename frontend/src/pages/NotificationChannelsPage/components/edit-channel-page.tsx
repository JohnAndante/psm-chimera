import { PageContainer } from "@/components/layout/page-container";
import { PageCard } from "@/components/layout/page-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notificationChannelsApi } from "@/controllers/notification-channels-api";
import { NotificationChannelType, type UpdateNotificationChannelData, type TelegramConfig, type EmailConfig, type WebhookConfig, type TelegramAllowedUser, type NotificationChannelData, type EditChannelFormData } from "@/types/notification-channel";
import { AnimatedWrapper } from "@/components/animated-wrapper";


export function EditChannelPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChannel, setIsLoadingChannel] = useState(true);
    const [allowedUsers, setAllowedUsers] = useState<TelegramAllowedUser[]>([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserChatId, setNewUserChatId] = useState('');
    const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});
    const [newHeaderKey, setNewHeaderKey] = useState('');
    const [newHeaderValue, setNewHeaderValue] = useState('');
    const [channel, setChannel] = useState<NotificationChannelData | null>(null);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { id } = useParams<{ id: string }>();

    // Funções de validação
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const isValidTelegramToken = (token: string): boolean => {
        // Formato básico do token do Telegram: xxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        const telegramTokenRegex = /^\d{8,10}:[a-zA-Z0-9_-]{35}$/;
        return telegramTokenRegex.test(token);
    };

    const form = useForm<EditChannelFormData>({
        defaultValues: {
            name: "",
            type: NotificationChannelType.TELEGRAM,
            active: true,
            bot_token: "",
            chat_id: "",
            enable_interactive: false,
            webhook_url: "",
            smtp_host: "",
            smtp_port: 587,
            smtp_user: "",
            smtp_password: "",
            from_email: "",
            from_name: "",
            use_tls: true,
            webhook_url_field: "",
            method: 'POST',
            timeout: 30000
        }
    });

    const selectedType = form.watch('type');

    // Carregar dados do canal
    useEffect(() => {
        const loadChannel = async () => {
            if (!id) {
                toast.error("ID do canal não fornecido");
                navigate('/canais-notificacao');
                return;
            }

            try {
                setIsLoadingChannel(true);
                const channel = await notificationChannelsApi.getById(parseInt(id));

                if (!channel) {
                    toast.error("Canal não encontrado");
                    navigate('/canais-notificacao');
                    return;
                }

                setChannel(channel);

                // Preencher formulário com dados do canal
                const formData: EditChannelFormData = {
                    name: channel.name,
                    type: channel.type,
                    active: channel.active
                };

                // Preencher configurações específicas por tipo
                if (channel.type === NotificationChannelType.TELEGRAM) {
                    const config = channel.config as TelegramConfig;
                    formData.bot_token = config.bot_token;
                    formData.chat_id = config.chat_id;
                    formData.enable_interactive = config.enable_interactive;
                    formData.webhook_url = config.webhook_url;

                    if (config.allowed_users) {
                        setAllowedUsers(config.allowed_users);
                    }
                } else if (channel.type === NotificationChannelType.EMAIL) {
                    const config = channel.config as EmailConfig;
                    formData.smtp_host = config.smtp_host;
                    formData.smtp_port = config.smtp_port;
                    formData.smtp_user = config.smtp_user;
                    formData.smtp_password = config.smtp_password;
                    formData.from_email = config.from_email;
                    formData.from_name = config.from_name;
                    formData.use_tls = config.use_tls;
                } else if (channel.type === NotificationChannelType.WEBHOOK) {
                    const config = channel.config as WebhookConfig;
                    formData.webhook_url_field = config.webhook_url;
                    formData.method = config.method;
                    formData.timeout = config.timeout;

                    if (config.headers) {
                        setCustomHeaders(config.headers);
                    }
                }

                form.reset(formData);
            } catch (error) {
                toast.error("Erro ao carregar canal", {
                    description: (error as Error)?.message || "Não foi possível carregar os dados do canal."
                });
                navigate('/canais-notificacao');
            } finally {
                setIsLoadingChannel(false);
            }
        };

        loadChannel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addAllowedUser = () => {
        if (!newUserName.trim() || !newUserChatId.trim()) {
            toast.error("Nome e Chat ID são obrigatórios");
            return;
        }

        const chatId = parseInt(newUserChatId);
        if (isNaN(chatId)) {
            toast.error("Chat ID deve ser um número válido");
            return;
        }

        if (allowedUsers.some(user => user.chat_id === chatId)) {
            toast.error("Este Chat ID já foi adicionado");
            return;
        }

        setAllowedUsers([...allowedUsers, {
            name: newUserName.trim(),
            chat_id: chatId
        }]);
        setNewUserName('');
        setNewUserChatId('');
    };

    const removeAllowedUser = (chatId: number) => {
        setAllowedUsers(allowedUsers.filter(user => user.chat_id !== chatId));
    };

    const addCustomHeader = () => {
        if (!newHeaderKey.trim() || !newHeaderValue.trim()) {
            toast.error("Chave e valor do header são obrigatórios");
            return;
        }

        if (customHeaders[newHeaderKey]) {
            toast.error("Este header já existe");
            return;
        }

        setCustomHeaders({
            ...customHeaders,
            [newHeaderKey]: newHeaderValue
        });
        setNewHeaderKey('');
        setNewHeaderValue('');
    };

    const removeCustomHeader = (key: string) => {
        const newHeaders = { ...customHeaders };
        delete newHeaders[key];
        setCustomHeaders(newHeaders);
    };

    const onSubmit = async (data: EditChannelFormData) => {
        if (!channel) return;

        setIsLoading(true);
        try {
            let config: TelegramConfig | EmailConfig | WebhookConfig;

            switch (data.type) {
                case NotificationChannelType.TELEGRAM:
                    config = {
                        bot_token: data.bot_token || "",
                        chat_id: data.chat_id || "",
                        allowed_users: allowedUsers.length > 0 ? allowedUsers : undefined,
                        enable_interactive: data.enable_interactive,
                        webhook_url: data.webhook_url || undefined
                    } as TelegramConfig;
                    break;

                case NotificationChannelType.EMAIL:
                    config = {
                        smtp_host: data.smtp_host || "",
                        smtp_port: data.smtp_port || 587,
                        smtp_user: data.smtp_user || "",
                        smtp_password: data.smtp_password || "",
                        from_email: data.from_email || "",
                        from_name: data.from_name || undefined,
                        use_tls: data.use_tls
                    } as EmailConfig;
                    break;

                case NotificationChannelType.WEBHOOK:
                    config = {
                        webhook_url: data.webhook_url_field || "",
                        method: data.method || 'POST',
                        headers: Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
                        timeout: data.timeout || 30000
                    } as WebhookConfig;
                    break;

                default:
                    throw new Error("Tipo de canal não suportado");
            }

            const updateData: UpdateNotificationChannelData = {
                name: data.name,
                config,
                active: data.active
            };

            await notificationChannelsApi.update(channel.id, updateData);

            toast.success("Canal atualizado com sucesso", {
                description: `O canal "${data.name}" foi atualizado.`
            });

            navigate('/canais-notificacao');
        } catch (error: unknown) {
            // Tratar erros de validação da API
            let errorMessage = "Não foi possível atualizar o canal.";

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as {
                    response?: {
                        data?: {
                            details?: string[];
                            error?: string;
                        };
                    };
                };
                if (apiError.response?.data?.details) {
                    // Se há detalhes específicos do erro, usar o primeiro
                    errorMessage = apiError.response.data.details[0] || errorMessage;
                } else if (apiError.response?.data?.error) {
                    errorMessage = apiError.response.data.error;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error("Erro ao atualizar canal", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingChannel) {
        return (
            <PageContainer
                title="Carregando..."
                subtitle="Aguarde enquanto carregamos os dados do canal"
            >
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </PageContainer>
        );
    }

    if (!channel) {
        return null;
    }

    return (
        <PageContainer
            title={`Editar Canal - ${channel.name}`}
            subtitle="Atualize as configurações do canal de notificação"
            breadcrumbs={[
                { label: "Canais de Notificação", to: "/canais-notificacao" },
                { label: "Editar Canal" }
            ]}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-20">
                    <AnimatedWrapper preset="fadeInUp" duration={0.3}>
                        <PageCard>
                            <div className="space-y-4">
                                {/* Informações Básicas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        rules={{ required: "Nome é obrigatório" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome do Canal</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Bot Telegram Principal" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="cursor-not-allowed">
                                                <FormLabel>Tipo de Canal</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        value={field.value}
                                                        disabled
                                                        className="bg-muted"
                                                    />
                                                </FormControl>
                                                {/* <FormDescription>
                                                O tipo do canal não pode ser alterado após a criação
                                            </FormDescription> */}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Canal Ativo</FormLabel>
                                                <FormDescription>
                                                    Determina se o canal está habilitado para envio de notificações
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </PageCard>
                    </AnimatedWrapper>

                    {/* Configurações Específicas do Telegram */}
                    {selectedType === NotificationChannelType.TELEGRAM && (
                        <AnimatedWrapper preset="fadeInUp" duration={0.3} delay={0.1}>
                            <PageCard cardTitle="Configurações do Telegram">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="bot_token"
                                            rules={{
                                                required: "Token do bot é obrigatório",
                                                validate: (value) => {
                                                    if (!value) return true; // Já validado pelo required
                                                    return isValidTelegramToken(value) || "Token do Telegram inválido. Formato esperado: 1234567890:ABC-DEF1GhI2JkL3mNo4Pqr5StU6vW7x8Y9Z0a";
                                                }
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Token do Bot</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="1234567890:ABCdefGHIjklMNOpqr..." {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Token obtido do @BotFather no Telegram
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="chat_id"
                                            rules={{ required: "Chat ID é obrigatório" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Chat ID Padrão</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="-1001234567890" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        ID do chat onde as notificações serão enviadas
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="enable_interactive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Habilitar Comandos Interativos</FormLabel>
                                                    <FormDescription>
                                                        Permitir que usuários enviem comandos através do bot
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Usuários Permitidos */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Usuários Permitidos</CardTitle>
                                            <CardDescription>
                                                Configure quais usuários podem enviar comandos para o bot.
                                                Se nenhum usuário for adicionado, o bot não aceitará comandos de ninguém.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Lista de usuários */}
                                            {allowedUsers.length > 0 && (
                                                <div className="space-y-2">
                                                    {allowedUsers.map((user) => (
                                                        <div key={user.chat_id} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div>
                                                                <p className="font-medium">{user.name}</p>
                                                                <p className="text-sm text-muted-foreground">Chat ID: {user.chat_id}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeAllowedUser(user.chat_id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Adicionar novo usuário */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <Input
                                                    placeholder="Nome do usuário"
                                                    value={newUserName}
                                                    onChange={(e) => setNewUserName(e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Chat ID"
                                                    value={newUserChatId}
                                                    type="number"
                                                    inputMode="numeric"
                                                    pattern="\d*"
                                                    onChange={(e) => setNewUserChatId(e.target.value)}
                                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addAllowedUser}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar
                                                </Button>
                                            </div>

                                            {allowedUsers.length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <p>Nenhum usuário adicionado.</p>
                                                    <p className="text-sm">O bot não aceitará comandos de ninguém.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </PageCard>
                        </AnimatedWrapper>
                    )}

                    {/* Configurações Específicas do Email */}
                    {selectedType === NotificationChannelType.EMAIL && (
                        <AnimatedWrapper preset="fadeInUp" duration={0.3} delay={0.1}>
                            <PageCard cardTitle="Configurações do Email">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="smtp_host"
                                            rules={{ required: "Servidor SMTP é obrigatório" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Servidor SMTP</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="smtp.gmail.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="smtp_port"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Porta SMTP</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="587"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="smtp_user"
                                            rules={{ required: "Usuário SMTP é obrigatório" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Usuário SMTP</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="alerts@company.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="smtp_password"
                                            rules={{ required: "Senha SMTP é obrigatória" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Senha SMTP</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="from_email"
                                            rules={{ required: "Email remetente é obrigatório" }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Remetente</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="alerts@company.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="from_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome Remetente (Opcional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="PSM Chimera Alerts" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="use_tls"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Usar TLS</FormLabel>
                                                    <FormDescription>
                                                        Habilitar criptografia TLS para conexão SMTP
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </PageCard>
                        </AnimatedWrapper>
                    )}

                    {/* Configurações Específicas do Webhook */}
                    {selectedType === NotificationChannelType.WEBHOOK && (
                        <AnimatedWrapper preset="fadeInUp" duration={0.3} delay={0.1}>
                            <PageCard cardTitle="Configurações do Webhook">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="webhook_url_field"
                                            rules={{
                                                required: "URL do webhook é obrigatória",
                                                validate: (value) => {
                                                    if (!value) return true; // Já validado pelo required
                                                    return isValidUrl(value) || "URL inválida. Deve começar com http:// ou https://";
                                                }
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>URL do Webhook</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Método HTTP</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o método" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="POST">POST</SelectItem>
                                                            <SelectItem value="PUT">PUT</SelectItem>
                                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="timeout"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Timeout (ms)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30000)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Tempo limite para a requisição em milissegundos
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Headers Customizados */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Headers Customizados</CardTitle>
                                            <CardDescription>
                                                Configure headers HTTP adicionais para a requisição
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Lista de headers */}
                                            {Object.keys(customHeaders).length > 0 && (
                                                <div className="space-y-2">
                                                    {Object.entries(customHeaders).map(([key, value]) => (
                                                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div>
                                                                <Badge variant="secondary" className="font-mono text-xs">
                                                                    {key}: {value}
                                                                </Badge>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeCustomHeader(key)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Adicionar novo header */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <Input
                                                    placeholder="Chave (ex: Authorization)"
                                                    value={newHeaderKey}
                                                    onChange={(e) => setNewHeaderKey(e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Valor"
                                                    value={newHeaderValue}
                                                    onChange={(e) => setNewHeaderValue(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addCustomHeader}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar
                                                </Button>
                                            </div>

                                            {Object.keys(customHeaders).length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    <p>Nenhum header customizado adicionado.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </PageCard>
                        </AnimatedWrapper>
                    )}


                </form>
            </Form>

            {/* Botões Flutuantes/Sticky */}
            <AnimatedWrapper preset="fadeIn" duration={0.5} delay={0.2}>
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
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        className="shadow-lg hover:shadow-xl transition-shadow"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </div>
            </AnimatedWrapper>
        </PageContainer>
    );
}
