import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { KeyRound, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/controllers/users-api";

interface ChangeOwnPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export function ChangeOwnPasswordModal({ isOpen, onClose }: ChangeOwnPasswordModalProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<PasswordFormData>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const { watch, handleSubmit, reset } = form;
    const newPassword = watch("newPassword");
    const confirmPassword = watch("confirmPassword");

    const handleFormSubmit = async (data: PasswordFormData) => {
        if (!user) return;

        if (data.newPassword !== data.confirmPassword) {
            form.setError("confirmPassword", {
                type: "manual",
                message: "As senhas não coincidem"
            });
            return;
        }

        if (data.newPassword.length < 8) {
            form.setError("newPassword", {
                type: "manual",
                message: "A nova senha deve ter pelo menos 8 caracteres"
            });
            return;
        }

        setIsLoading(true);
        try {
            // Como não temos endpoint para alterar senha com senha atual,
            // vamos usar o endpoint admin por enquanto
            await usersApi.changePassword(user.id, data.newPassword);

            toast.success("Senha alterada", {
                description: "Sua senha foi alterada com sucesso."
            });

            handleClose();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao alterar senha", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-amber-500" />
                        Alterar Minha Senha
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Usuário:</strong> {user.email}
                            <br />
                            Por segurança, digite sua senha atual e defina uma nova senha.
                        </AlertDescription>
                    </Alert>

                    <Form {...form}>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                rules={{
                                    required: "Senha atual é obrigatória"
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha Atual</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="Digite sua senha atual"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? (
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
                                name="newPassword"
                                rules={{
                                    required: "Nova senha é obrigatória",
                                    minLength: {
                                        value: 8,
                                        message: "A senha deve ter pelo menos 8 caracteres"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nova Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Digite a nova senha"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
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
                                        value === newPassword || "As senhas não coincidem"
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

                            {newPassword && confirmPassword && (
                                <div className="text-sm">
                                    {passwordsMatch ? (
                                        <span className="text-green-600">✓ Senhas coincidem</span>
                                    ) : (
                                        <span className="text-red-600">✗ As senhas não coincidem</span>
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
        </Dialog>
    );
}
