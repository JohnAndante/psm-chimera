import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import type { Store } from "@/types/store";
import { StoreController } from "@/controllers/store.controller";
import { useToast } from "@/hooks/use-toast";

interface DeleteStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | null;
    onSuccess?: () => void;
}

export function DeleteStoreModal({
    isOpen,
    onClose,
    store,
    onSuccess
}: DeleteStoreModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConfirmDelete = async () => {
        if (!store) return;

        setIsLoading(true);
        try {
            await StoreController.deleteStore(store.id);

            toast.success("Loja deletada", {
                description: `Loja ${store.name} foi deletada com sucesso.`
            });

            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao deletar loja", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!store) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Deletar Loja
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Atenção!</strong> Esta ação não pode ser desfeita.
                            A loja será permanentemente removida do sistema.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Você está prestes a deletar a seguinte loja:
                        </p>
                        <div className="bg-muted p-3 rounded-lg space-y-1">
                            <p><strong>Nome:</strong> {store.name}</p>
                            <p><strong>Registro:</strong> {store.registration}</p>
                            <p><strong>Documento:</strong> {store.document}</p>
                            <p><strong>Status:</strong> {store.active ? "Ativa" : "Inativa"}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deletando..." : "Deletar Loja"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}