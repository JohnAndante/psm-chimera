import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/stores/auth"
import { Calendar, Edit3, Mail, Shield, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditProfileModal } from "./edit-profile-modal"
import { ChangeOwnPasswordModal } from "./change-own-password-modal"
import { useState } from "react"

export default function ProfileModal() {
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)

    const { user: currentUser, profileModalOpen, setProfileModalOpen } = useAuth()

    const handleEditProfile = () => {
        setProfileModalOpen(false) // Fecha a modal de perfil
        setEditProfileModalOpen(true) // Abre a modal de edição
    }

    const handleChangePassword = () => {
        setProfileModalOpen(false) // Fecha a modal de perfil
        setChangePasswordModalOpen(true) // Abre a modal de senha
    }

    if (!currentUser) {
        return null
    }

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'USER':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrador'
            case 'USER':
                return 'Usuário'
            default:
                return 'Usuário'
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Não informado'

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Não informado'
        }
    }

    return (
        <>
            <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen} modal>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-foreground">
                            Meu Perfil
                        </DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Informações da sua conta no sistema
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Avatar e nome principal */}
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={currentUser.avatar || ''} />
                                <AvatarFallback className="gradient-primary text-white text-xl font-medium">
                                    {getUserInitials(currentUser.name || '')}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {currentUser.name}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {currentUser.email}
                                </p>
                                <Badge
                                    className={`mt-2 ${getRoleBadgeColor(currentUser.role || '')}`}
                                >
                                    {getRoleLabel(currentUser.role || '')}
                                </Badge>
                            </div>
                        </div>

                        {/* Informações detalhadas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações da Conta</CardTitle>
                                <CardDescription>
                                    Dados pessoais e de acesso
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Nome completo */}
                                <div className="flex-col items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">Nome Completo</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {currentUser.name}
                                    </p>
                                </div>

                                {/* Email */}
                                <div className="flex-col items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">Email</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {currentUser.email}
                                    </p>
                                </div>

                                {/* Último Login */}
                                {currentUser.lastLogin && (
                                    <div className="flex-col items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <p className="text-sm font-medium text-foreground">Último Login</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {formatDate(currentUser.lastLogin)}
                                        </p>
                                    </div>
                                )}

                                {/* Tipo de Conta */}
                                <div className="flex-col items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">Tipo de Conta</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {getRoleLabel(currentUser.role || '')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ações */}
                        {/* Dividir em duas colunas */}
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={handleEditProfile}
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Editar dados
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={handleChangePassword}
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Editar Senha
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modais de edição - fora da modal principal */}
            <EditProfileModal
                isOpen={editProfileModalOpen}
                onClose={() => setEditProfileModalOpen(false)}
            />

            <ChangeOwnPasswordModal
                isOpen={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />
        </>
    )
}
