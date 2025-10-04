import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { SquarePen } from "lucide-react";
import type { Store } from "@/types/store";
import { storeApi } from "@/controllers/store-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { UpdateStoreRequest } from "@/types/store";

interface EditStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | null;
    onSuccess?: () => void;
}

export interface EditStoreFormData {
    name: string;
    registration: string;
    document: string;
    cnpj?: string;
    active: boolean;
}

export function EditStoreModal({
    isOpen,
    onClose,
    store,
    onSuccess
}: EditStoreModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm<EditStoreFormData>({
        defaultValues: {
            name: store?.name || "",
            registration: store?.registration || "",
            document: store?.document || "",
            cnpj: store?.cnpj || "",
            active: store?.active ?? true
        }
    });

    const { handleSubmit, reset } = form;

    React.useEffect(() => {
        if (isOpen && store) {
            reset({
                name: store.name,
                registration: store.registration,
                document: store.document,
                cnpj: store.cnpj || "",
                active: store.active
            });
        }
    }, [isOpen, store, reset]);

    const handleFormSubmit = async (data: EditStoreFormData) => {
        if (!store) return;

        setIsLoading(true);

        const updateData: UpdateStoreRequest = {
            name: data.name,
            registration: data.registration,
            document: data.document,
            cnpj: data.cnpj || undefined,
            active: data.active
        };

        storeApi.updateStore(store.id, updateData)
            .then(() => {
                toast.success("Loja atualizada", {
                    description: `Dados da loja ${data.name} foram atualizados com sucesso.`
                });

                handleClose();
                onSuccess?.();
            })
            .catch((error: unknown) => {
                // Tratativa genérica de erro
                if (error && typeof error === 'object' && 'message' in error) {
                    const errorMessage = error.message as string;
                    toast.error("Erro ao atualizar loja", {
                        description: errorMessage
                    });
                } else {
                    toast.error("Erro ao atualizar loja", {
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

    if (!store) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SquarePen className="h-5 w-5 text-blue-500" />
                        Editar Loja
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
                                    <FormLabel>Nome da Loja</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Digite o nome da loja"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="registration"
                            rules={{
                                required: "Registro é obrigatório",
                                minLength: {
                                    value: 2,
                                    message: "Registro deve ter pelo menos 2 caracteres"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registro</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Digite o registro da loja"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="document"
                            rules={{
                                required: "Documento é obrigatório",
                                minLength: {
                                    value: 2,
                                    message: "Documento deve ter pelo menos 2 caracteres"
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Documento</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Digite o documento da loja"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Digite o CNPJ da loja"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Loja Ativa
                                        </FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Define se a loja está ativa no sistema
                                        </div>
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
                                disabled={isLoading}
                            >
                                {isLoading ? "Atualizando..." : "Atualizar Loja"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
