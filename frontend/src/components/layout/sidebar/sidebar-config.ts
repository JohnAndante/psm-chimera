import { LayoutDashboard, ShieldUser } from "lucide-react"
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
