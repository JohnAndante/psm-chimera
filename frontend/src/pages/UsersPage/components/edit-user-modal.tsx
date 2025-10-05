import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SquarePen } from "lucide-react";
import type { BaseUser } from "@/types/user-api";
import { usersApi } from "@/controllers/users-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: BaseUser | null;
    onSuccess?: () => void;
}

export interface EditUserFormData {
    name: string;
    email: string;
    role: "ADMIN" | "USER";
}

export function EditUserModal({
    isOpen,
    onClose,
    user,
    onSuccess
}: EditUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm<EditUserFormData>({
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "USER"
        }
    });

    const { handleSubmit, reset } = form;

    React.useEffect(() => {
        if (isOpen && user) {
            reset({
                name: user.name,
                email: user.email,
                role: user.role
            });
        }
    }, [isOpen, user, reset]);

    const handleFormSubmit = async (data: EditUserFormData) => {
        if (!user) return;

        setIsLoading(true);
        await usersApi.update(user.id, data)
            .then(() => {
                toast.success("Usuário atualizado", {
                    description: `Dados do usuário ${data.name} foram atualizados com sucesso.`
                });

                handleClose();
                onSuccess?.();
            })
            .catch((error: unknown) => {
                // Tratativa específica para email já cadastrado
                if (error && typeof error === 'object' && 'message' in error) {
                    const errorMessage = error.message as string;
                    if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
                        form.setError("email", {
                            type: "manual",
                            message: "Este email já está cadastrado"
                        });
                        toast.error("Email já cadastrado", {
                            description: "Este email já está sendo usado por outro usuário"
                        });
                    } else {
                        toast.error("Erro ao atualizar usuário", {
                            description: errorMessage
                        });
                    }
                } else {
                    toast.error("Erro ao atualizar usuário", {
                        description: "Erro desconhecido"
                    });
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SquarePen className="h-5 w-5 text-blue-500" />
                        Editar Usuário
                    </DialogTitle>
                </DialogHeader>

                {/* If user is not provided yet, render a placeholder skeleton so the
                    Dialog remains mounted and Radix can run open/close animations. */}
                {!user ? (
                    <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                        Carregando dados do usuário...
                    </div>
                ) : (
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
                )}
            </DialogContent>
        </Dialog>
    );
}
