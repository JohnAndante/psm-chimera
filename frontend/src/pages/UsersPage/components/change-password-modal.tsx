import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff, RefreshCw, Shield, ThumbsDown, ThumbsUp } from "lucide-react";
import { generateRandomPassword } from "@/utils/password";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { BaseUser } from "@/types/user-api";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    user: BaseUser | null;
    isLoading?: boolean;
}

interface PasswordFormData {
    password: string;
    confirmPassword: string;
}

export function ChangePasswordModal({
    isOpen,
    onClose,
    onSubmit,
    user,
    isLoading = false
}: ChangePasswordModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<PasswordFormData>({
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const { watch, setValue, handleSubmit, reset } = form;
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    // Gerar senha aleatória quando a modal abrir
    useEffect(() => {
        if (isOpen) {
            const randomPassword = generateRandomPassword();
            setValue("password", randomPassword);
            setValue("confirmPassword", randomPassword);
        }
    }, [isOpen, setValue]);

    const handleGenerateNewPassword = () => {
        const newPassword = generateRandomPassword();
        setValue("password", newPassword);
        setValue("confirmPassword", newPassword);
    };

    const handleFormSubmit = (data: PasswordFormData) => {
        if (data.password !== data.confirmPassword) {
            form.setError("confirmPassword", {
                type: "manual",
                message: "As senhas não coincidem"
            });
            return;
        }
        onSubmit(data.password);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const passwordsMatch = password === confirmPassword && password.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-amber-500" />
                        Alterar Senha
                    </DialogTitle>
                    <DialogDescription>
                        Altere a senha da conta de {user?.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert className="p-4 border-amber-500">
                        <AlertTitle className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 inline text-amber-500" />
                            Atenção
                        </AlertTitle>
                        <AlertDescription>
                            Uma nova senha será definida para este usuário.
                            <br />
                            Por segurança,
                            recomendamos que seja solicitado ao usuário que altere a senha
                            no primeiro acesso.
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{
                                    required: "Nova senha é obrigatória",
                                    minLength: {
                                        value: 8,
                                        message: "A senha deve ter pelo menos 8 caracteres"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            Nova Senha
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleGenerateNewPassword}
                                                className="h-auto p-1 text-xs"
                                            >
                                                <RefreshCw className="h-3 w-3 mr-1" />
                                                Gerar Nova
                                            </Button>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Digite a nova senha"
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
                                        <FormLabel>Confirmar Nova Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirme a nova senha"
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
                                        <span className="text-green-600 flex items-center">
                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                            Senhas coincidem
                                        </span>
                                    ) : (
                                        <span className="text-red-600 flex items-center">
                                            <ThumbsDown className="h-4 w-4 mr-2" />
                                            As senhas não coincidem
                                        </span>
                                    )}
                                </div>
                            )}

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
                                    Alterar Senha
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog >
    );
}
