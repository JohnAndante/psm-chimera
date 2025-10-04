import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout"
import { useAuth } from "@/stores/auth"

import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import UsersPage from "@/pages/UsersPage/components/users-list"
import StoresPage from "@/pages/StoresPage/components/stores-list"
import NotificationChannelsPage from "@/pages/NotificationChannelsPage"
import { CreateChannelPage, EditChannelPage, ChannelDetailsPage } from "@/pages/NotificationChannelsPage/components"
import IntegrationsPage from "@/pages/IntegrationsPage"
import { CreateIntegrationPage, EditIntegrationPage, IntegrationDetailsPage } from "@/pages/IntegrationsPage/components"
import SyncPage from "@/pages/SyncPage"
import { CreateSyncConfigPage } from "@/pages/SyncPage/components"
import CronTestPage from "@/pages/CronTestPage"
import { LogsPage } from "@/pages/LogsPage"

function ProtectedRoute() {
    const { isAuthenticated, validateToken } = useAuth()

    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Valida o token no backend
    validateToken()

    return (
        <Layout>
            <Outlet />
        </Layout>
    )
}

function RedirectToDashboard() {
    return <Navigate to="/" replace />
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rotas privadas agrupadas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} />

                {/* Rotas de Usuários */}
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/usuarios/novo" element={<UsersPage />} />
                <Route path="/usuarios/:id" element={<UsersPage />} />
                <Route path="/usuarios/:id/editar" element={<UsersPage />} />

                {/* Rotas de Lojas */}
                <Route path="/lojas" element={<StoresPage />} />
                <Route path="/lojas/novo" element={<StoresPage />} />
                <Route path="/lojas/:id" element={<StoresPage />} />
                <Route path="/lojas/:id/editar" element={<StoresPage />} />

                {/* Rotas de Canais de Notificação */}
                <Route path="/canais-notificacao" element={<NotificationChannelsPage />} />
                <Route path="/canais-notificacao/novo" element={<CreateChannelPage />} />
                <Route path="/canais-notificacao/:id" element={<ChannelDetailsPage />} />
                <Route path="/canais-notificacao/:id/editar" element={<EditChannelPage />} />

                {/* Rotas de Integrações */}
                <Route path="/integracoes" element={<IntegrationsPage />} />
                <Route path="/integracoes/novo" element={<CreateIntegrationPage />} />
                <Route path="/integracoes/:id" element={<IntegrationDetailsPage />} />
                <Route path="/integracoes/:id/editar" element={<EditIntegrationPage />} />

                {/* Rotas de Sincronizações */}
                <Route path="/sincronizacoes" element={<SyncPage />} />
                <Route path="/sincronizacoes/novo" element={<CreateSyncConfigPage />} />

                {/* Rota de Teste do Cron */}
                <Route path="/teste-cron" element={<CronTestPage />} />

                {/* Rota de Logs */}
                <Route path="/logs" element={<LogsPage />} />
            </Route>
            <Route path="*" element={<RedirectToDashboard />} />
        </Routes>
    )
}
