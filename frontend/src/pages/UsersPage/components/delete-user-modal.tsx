import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";
import type { BaseUser } from "@/types/user-api";
import { usersApi } from "@/controllers/users-api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: BaseUser | null;
    onSuccess?: () => void;
}

export function DeleteUserModal({
    isOpen,
    onClose,
    user,
    onSuccess
}: DeleteUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConfirmDelete = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            await usersApi.delete(user.id);

            toast.success("Usuário deletado", {
                description: `Usuário ${user.name} foi deletado com sucesso.`
            });

            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error("Erro ao deletar usuário", {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && user && (
                <motion.div
                    key="delete-user-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Dialog open={true} onOpenChange={onClose}>
                        <DialogContent className="sm:max-w-md" aria-describedby="Confirmação para deletar usuário">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Trash2 className="h-5 w-5 text-red-500" />
                                    Deletar Usuário
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Você está prestes a deletar o seguinte usuário:
                                    </p>
                                    <div className="bg-muted p-3 rounded-lg space-y-1">
                                        <p><strong>Nome:</strong> {user.name}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Cargo:</strong> {user.role === "ADMIN" ? "Administrador" : "Usuário"}</p>
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
                                        Deletar Usuário
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
