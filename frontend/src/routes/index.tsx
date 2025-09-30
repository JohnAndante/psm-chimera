import { Routes, Route, Outlet, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout"
import { useAuth } from "@/stores/auth"

import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import AgentesPage from "@/pages/AgentesPage"
import UsersPage from "@/pages/UsersPage/components/users-list"
import NotificationChannelsPage from "@/pages/NotificationChannelsPage"
import { CreateChannelPage, EditChannelPage, ChannelDetailsPage } from "@/pages/NotificationChannelsPage/components"

function ProtectedRoute() {
    const { isAuthenticated } = useAuth()

    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

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

                {/* Rotas de Agentes */}
                <Route path="/agentes" element={<AgentesPage />} />
                <Route path="/agentes/novo" element={<AgentesPage />} />
                <Route path="/agentes/:id" element={<AgentesPage />} />
                <Route path="/agentes/:id/editar" element={<AgentesPage />} />

                {/* Rotas de Usuários */}
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/usuarios/novo" element={<UsersPage />} />
                <Route path="/usuarios/:id" element={<UsersPage />} />
                <Route path="/usuarios/:id/editar" element={<UsersPage />} />

                {/* Rotas de Canais de Notificação */}
                <Route path="/canais-notificacao" element={<NotificationChannelsPage />} />
                <Route path="/canais-notificacao/novo" element={<CreateChannelPage />} />
                <Route path="/canais-notificacao/:id" element={<ChannelDetailsPage />} />
                <Route path="/canais-notificacao/:id/editar" element={<EditChannelPage />} />
            </Route>
            <Route path="*" element={<RedirectToDashboard />} />
        </Routes>
    )
}
