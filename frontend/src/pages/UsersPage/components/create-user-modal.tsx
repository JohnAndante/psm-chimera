import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { UserPlus, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
import { generateRandomPassword } from "@/utils/password";
import { usersApi } from "@/controllers/users-api";
import { useToast } from "@/hooks/use-toast";
import type { ApiError } from "@/types/api";
import { HTTP_STATUS, getErrorType } from "@/types/api-error";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export interface CreateUserFormData {
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    password: string;
    confirmPassword: string;
}

export function CreateUserModal({
    isOpen,
    onClose,
    onSuccess
}: CreateUserModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateUserFormData>({
        defaultValues: {
            name: "",
            email: "",
            role: "USER",
            password: "",
            confirmPassword: ""
        }
    });

    const { watch, setValue, handleSubmit, reset } = form;
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    // Gerar senha aleatória quando a modal abrir ou quando ativar geração automática
    useEffect(() => {
        if (isOpen && autoGeneratePassword) {
            const randomPassword = generateRandomPassword();
            setValue("password", randomPassword);
            setValue("confirmPassword", randomPassword);
        }
    }, [isOpen, autoGeneratePassword, setValue]);

    // Limpar senhas quando desativar geração automática
    useEffect(() => {
        if (!autoGeneratePassword) {
            setValue("password", "");
            setValue("confirmPassword", "");
        }
    }, [autoGeneratePassword, setValue]);

    const handleGenerateNewPassword = () => {
        const newPassword = generateRandomPassword();
        setValue("password", newPassword);
        setValue("confirmPassword", newPassword);
    };

    const handleFormSubmit = async (data: CreateUserFormData) => {
        if (data.password !== data.confirmPassword) {
            form.setError("confirmPassword", {
                type: "manual",
                message: "As senhas não coincidem"
            });
            return;
        }

        setIsLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...createData } = data;
        usersApi.create(createData)
            .then(() => {

                toast.success("Usuário criado", {
                    description: `Usuário ${data.name} foi criado com sucesso.`
                });

                handleClose();
                onSuccess?.();
            })
            .catch((apiError: ApiError) => {
                // Converter message para string (pode ser string ou string[])
                const errorMessage = Array.isArray(apiError.message)
                    ? apiError.message.join(', ')
                    : apiError.message;

                // Tratativa específica para conflitos (email já cadastrado)
                if (apiError.statusCode === HTTP_STATUS.CONFLICT) {
                    form.setError("email", {
                        type: "manual",
                        message: "Este email já está cadastrado"
                    });
                    toast.error("Email já cadastrado", {
                        description: errorMessage
                    });
                } else {
                    // Tratativa genérica para outros erros
                    const errorType = getErrorType(apiError.statusCode);
                    toast.error("Erro ao criar usuário", {
                        description: errorMessage
                    });

                    // Log do tipo de erro para debug
                    console.error(`API Error [${errorType}]:`, apiError);
                }
            })
            .finally(() => {
                setIsLoading(false);
            })
    };

    const handleClose = () => {
        reset();
        setAutoGeneratePassword(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const passwordsMatch = password === confirmPassword && password.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose} modal>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-green-500" />
                        Novo Usuário
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            Um novo usuário será criado no sistema. Por segurança,
                            recomendamos que seja solicitado ao usuário que altere a senha
                            no primeiro acesso.
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{
                                    required: "Nome é obrigatório",
                                    minLength: {
                                        value: 2,
                                        message: "Nome deve ter pelo menos 2 caracteres"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Digite o nome completo"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                rules={{
                                    required: "Email é obrigatório",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Email inválido"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="Digite o email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                rules={{
                                    required: "Cargo é obrigatório"
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione o cargo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USER">Usuário</SelectItem>
                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-generate-password" className="text-sm font-medium">
                                        Gerar senha automaticamente
                                    </Label>
                                    <Switch
                                        id="auto-generate-password"
                                        checked={autoGeneratePassword}
                                        onCheckedChange={setAutoGeneratePassword}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{
                                        required: "Senha é obrigatória",
                                        minLength: {
                                            value: 8,
                                            message: "A senha deve ter pelo menos 8 caracteres"
                                        }
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center justify-between">
                                                Senha
                                                {autoGeneratePassword && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleGenerateNewPassword}
                                                        className="h-auto p-1 text-xs"
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        Gerar Nova
                                                    </Button>
                                                )}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder={autoGeneratePassword ? "Senha gerada automaticamente" : "Digite a senha"}
                                                        readOnly={autoGeneratePassword}
                                                        className={autoGeneratePassword ? "bg-muted" : ""}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    rules={{
                                        required: "Confirmação de senha é obrigatória",
                                        validate: (value) =>
                                            value === password || "As senhas não coincidem"
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder={autoGeneratePassword ? "Confirmação preenchida automaticamente" : "Confirme a senha"}
                                                        readOnly={autoGeneratePassword}
                                                        className={autoGeneratePassword ? "bg-muted" : ""}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {password && confirmPassword && (
                                    <div className="text-sm">
                                        {passwordsMatch ? (
                                            <span className="text-green-600">✓ Senhas coincidem</span>
                                        ) : (
                                            <span className="text-red-600">✗ As senhas não coincidem</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!passwordsMatch}
                                    loading={isLoading}
                                >
                                    Criar Usuário
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
