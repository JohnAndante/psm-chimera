import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Store as StoreIcon } from "lucide-react";
import { storeApi } from "@/controllers/store-api";
import { useToast } from "@/hooks/use-toast";
import type { ApiError } from "@/types/api";
import { HTTP_STATUS, getErrorType } from "@/types/api-error";
import type { CreateStoreRequest } from "@/types/store";

interface CreateStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export interface CreateStoreFormData {
    name: string;
    registration: string;
    document: string;
    cnpj?: string;
    active: boolean;
}

export function CreateStoreModal({
    isOpen,
    onClose,
    onSuccess
}: CreateStoreModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateStoreFormData>({
        defaultValues: {
            name: "",
            registration: "",
            document: "",
            cnpj: "",
            active: true
        }
    });

    const { handleSubmit, reset } = form;

    const handleFormSubmit = async (data: CreateStoreFormData) => {
        setIsLoading(true);

        const createData: CreateStoreRequest = {
            name: data.name,
            registration: data.registration,
            document: data.document,
            cnpj: data.cnpj || undefined,
            active: data.active
        };

        storeApi.createStore(createData)
            .then(() => {
                toast.success("Loja criada", {
                    description: `Loja ${data.name} foi criada com sucesso.`
                });

                handleClose();
                onSuccess?.();
            })
            .catch((apiError: ApiError) => {
                // Converter message para string (pode ser string ou string[])
                const errorMessage = Array.isArray(apiError.message)
                    ? apiError.message.join(', ')
                    : apiError.message;

                // Tratativa específica para conflitos
                if (apiError.statusCode === HTTP_STATUS.CONFLICT) {
                    toast.error("Dados já cadastrados", {
                        description: errorMessage
                    });
                } else {
                    // Tratativa genérica para outros erros
                    const errorType = getErrorType(apiError.statusCode);
                    toast.error("Erro ao criar loja", {
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
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <StoreIcon className="h-5 w-5 text-green-500" />
                        Nova Loja
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{
                                required: "Nome é obrigatório",
                                minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Loja *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o nome da loja"
                                            {...field}
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
                                minLength: { value: 2, message: "Registro deve ter pelo menos 2 caracteres" }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registro *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o registro da loja"
                                            {...field}
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
                                required: "CNPJ é obrigatório",
                                minLength: { value: 2, message: "CNPJ deve ter pelo menos 2 caracteres" }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite o CNPJ da loja"
                                            {...field}
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
                                {isLoading ? "Criando..." : "Criar Loja"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
