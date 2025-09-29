import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { User } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/controllers/users-api";
import type { ApiError } from "@/types/api";
import { HTTP_STATUS } from "@/types/api-error";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface EditProfileFormData {
    name: string;
    email: string;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<EditProfileFormData>({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || ""
        }
    });

    const { handleSubmit, reset } = form;

    // Resetar o formulário quando o usuário mudar ou a modal abrir
    React.useEffect(() => {
        if (isOpen && user) {
            reset({
                name: user.name,
                email: user.email
            });
        }
    }, [isOpen, user, reset]);

    const handleFormSubmit = async (data: EditProfileFormData) => {
        if (!user) return;

        setIsLoading(true);
        try {
            await usersApi.update(user.id, {
                name: data.name,
                email: data.email,
                role: (user.role as "ADMIN" | "USER") || "USER" // Manter o role atual
            });

            // Os dados serão atualizados no próximo refresh ou login

            toast.success("Dados atualizados", {
                description: "Seus dados foram atualizados com sucesso."
            });

            handleClose();
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = Array.isArray(apiError.message)
                ? apiError.message.join(', ')
                : apiError.message;

            // Tratativa específica para conflitos (email já cadastrado)
            if (apiError.statusCode === HTTP_STATUS.CONFLICT) {
                form.setError("email", {
                    type: "manual",
                    message: "Este email já está sendo usado"
                });
                toast.error("Email já cadastrado", {
                    description: errorMessage
                });
            } else {
                toast.error("Erro ao atualizar dados", {
                    description: errorMessage
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Editar Meus Dados
                    </DialogTitle>
                </DialogHeader>

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
                                            placeholder="Digite seu nome completo"
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
                                            placeholder="Digite seu email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                loading={isLoading}
                            >
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
