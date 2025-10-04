import { LayoutDashboard, Bell, ShieldUser, Link2, RefreshCw, TestTube, FileText, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
    id: string
    title: string
    icon: LucideIcon
    href?: string
    isGroup?: boolean
    children?: SidebarItem[]
    exact?: boolean
}

export const sidebarItems: SidebarItem[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        exact: true
    },
    {
        id: "usuarios",
        title: "Usuários",
        icon: ShieldUser,
        href: "/usuarios",
        exact: true
    },
    {
        id: "lojas",
        title: "Lojas",
        icon: Store,
        href: "/lojas",
        exact: true
    },
    {
        id: "canais-notificacao",
        title: "Canais de Notificação",
        icon: Bell,
        href: "/canais-notificacao",
        exact: true
    },
    {
        id: "integracoes",
        title: "Integrações",
        icon: Link2,
        href: "/integracoes",
        exact: true
    },
    {
        id: "sincronizacoes",
        title: "Sincronizações",
        icon: RefreshCw,
        href: "/sincronizacoes",
        exact: true
    },
    {
        id: "teste-cron",
        title: "Teste Cron",
        icon: TestTube,
        href: "/teste-cron",
        exact: true
    },
    {
        id: "logs",
        title: "Logs",
        icon: FileText,
        href: "/logs",
        exact: true
    },
    // {
    //     id: "components",
    //     title: "Componentes",
    //     icon: MousePointer,
    //     isGroup: true,
    //     children: [
    //         {
    //             id: "buttons",
    //             title: "Botões",
    //             icon: MousePointer,
    //             href: "/buttons"
    //         },
    //         {
    //             id: "cards",
    //             title: "Cartões",
    //             icon: CreditCard,
    //             href: "/cards"
    //         },
    //         {
    //             id: "avatars",
    //             title: "Avatares",
    //             icon: User,
    //             href: "/avatars"
    //         },
    //         {
    //             id: "forms",
    //             title: "Formulários",
    //             icon: FileText,
    //             href: "/forms"
    //         }
    //     ]
    // }
]
