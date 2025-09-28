import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SquarePen } from "lucide-react";
import type { BaseUser } from "@/types/user-api";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: EditUserFormData) => void;
    user: BaseUser | null;
    isLoading?: boolean;
}

export interface EditUserFormData {
    name: string;
    email: string;
    role: "ADMIN" | "USER";
}

export function EditUserModal({
    isOpen,
    onClose,
    onSubmit,
    user,
    isLoading = false
}: EditUserModalProps) {
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

    const handleFormSubmit = (data: EditUserFormData) => {
        onSubmit(data);
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
                        <SquarePen className="h-5 w-5 text-blue-500" />
                        Editar Usuário
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
            </DialogContent>
        </Dialog>
    );
}
