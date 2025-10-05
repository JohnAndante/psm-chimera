import { Alert, AlertDescription } from "@/components/ui/alert";
import { notificationChannelsApi } from "@/controllers/notification-channels-api";
import { useToast } from "@/hooks/use-toast";
import type { NotificationChannelData } from "@/types/notification-channel";
import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DeleteChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: NotificationChannelData | null;
    onSuccess?: () => void;
}


export function DeleteChannelModal({
    isOpen,
    onClose,
    channel,
    onSuccess
}: DeleteChannelModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConfirmDelete = async () => {
        if (!channel) return;

        setIsLoading(true);
        try {
            await notificationChannelsApi.delete(channel.id);

            toast.success("Canal deletado", {
                description: `Canal ${channel.name} foi deletado com sucesso.`
            });

            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao deletar canal", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!channel) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Deletar Canal de Notificação
                    </DialogTitle>
                </DialogHeader>

                <div>
                    <div className="space-y-2 mt-2">
                        <p className="text-sm text-muted-foreground">
                            Você está prestes a deletar o seguinte canal de notificação:
                        </p>
                        <div className="bg-muted p-3 rounded-lg space-y-1">
                            <p><strong>Nome:</strong> {channel.name}</p>
                            <p><strong>Tipo:</strong> {channel.type}</p>
                            <p><strong>Status:</strong> {channel.active ? "Ativo" : "Inativo"}</p>
                        </div>
                    </div>

                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>Esta ação não pode ser desfeita.</AlertDescription>
                    </Alert>

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
                            loading={isLoading}
                        >
                            Deletar Canal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
