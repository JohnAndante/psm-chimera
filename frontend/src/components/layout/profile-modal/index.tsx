import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/stores/auth"
import { Building2, Calendar, Edit3, Mail, Shield, User, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ProfileModal() {

    const { user: currentUser, profileModalOpen, setProfileModalOpen } = useAuth()

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
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'user':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrador'
            case 'manager':
                return 'Gerente'
            case 'user':
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
        <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Perfil do usuário
                    </DialogTitle>
                    <DialogDescription>
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
                                variant="outline"
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

                            {/* ID do Usuário */}
                            <div className="flex-col items-center gap-2">
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">ID</p>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {currentUser.id}
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

                            {/* Empresa */}
                            <div className="flex-col items-center gap-2">
                                <div className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">Empresa</p>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {currentUser.company_name || 'Não informado'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ações */}
                    <div className="flex flex-col space-y-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled // Desabilitado por enquanto
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar Perfil
                        </Button>

                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                                A edição de perfil estará disponível em breve
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
