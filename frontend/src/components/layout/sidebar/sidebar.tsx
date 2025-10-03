import { Link, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, Moon, Sun, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { sidebarItems, type SidebarItem } from "./sidebar-config"
import {
    Sidebar as SidebarPrimitive,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/stores/auth"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { useSidebar } from "@/components/ui/sidebar"
import { LogoPSM } from "@/components/smart-svgs/logo-psm"

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const { user: currentUser, logout, setProfileModalOpen } = useAuth()
    const { state, toggleSidebar } = useSidebar()
    const isCollapsed = state === "collapsed"

    const isActive = (item: SidebarItem) => {
        if (!item.href) return false

        if (item.exact) {
            return location.pathname === item.href
        }

        return location.pathname.startsWith(item.href)
    }

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const renderSidebarItem = (item: SidebarItem) => {
        const Icon = item.icon

        if (item.isGroup && item.children) {
            if (isCollapsed) {
                return null
            }

            return (
                <Collapsible key={item.id} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                <Icon />
                                <span>{item.title}</span>
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {item.children.map((child) => (
                                    <SidebarMenuSubItem key={child.id}>
                                        <SidebarMenuSubButton asChild>
                                            <Link to={child.href || "#"}>
                                                <child.icon />
                                                <span>{child.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            )
        }

        if (item.href) {
            return (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive(item)}>
                        <Link to={item.href} className={cn(
                            "flex items-center justify-start gap-4 px-4 py-2 rounded-lg hover:bg-muted/50",
                            isCollapsed ? "ml-2" : ""
                        )}>
                            <Icon />
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )
        }

        return null
    }

    return (
        <>
            <SidebarPrimitive
                className={cn(
                    "select-none transition-all duration-300 ease-in-out flex flex-col h-screen",
                    "w-[var(--sidebar-width)] group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
                )}
                collapsible="icon"
            >
                {/* Header do Sidebar */}
                <SidebarHeader>
                    <SidebarContent className="border-border w-full flex-shrink-0 overflow-hidden">
                        <div className={cn(
                            "flex items-center h-12 mx-2 gap-2 w-max cursor-pointer justify-start",
                            isCollapsed ? "" : ""
                        )}>
                            <LogoPSM size={32} primaryColor={theme === 'dark' ? 'default' : 'darkBlue'} />
                            {!isCollapsed && (
                                <span className="text-md font-bold whitespace-nowrap">
                                    PSM Chimera
                                </span>
                            )}
                        </div>
                    </SidebarContent>
                </SidebarHeader>

                {/* Conteudo do Sidebar */}
                <div className="flex-1 overflow-hidden">
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {sidebarItems.map(item => renderSidebarItem(item))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </div>

                {/* Footer do Sidebar */}
                <SidebarFooter className="border-t border-border flex-shrink-0">
                    <SidebarContent>
                        {/* Botão de Toggle */}
                        <SidebarMenuItem key="toggle">
                            <SidebarMenuButton
                                onClick={toggleSidebar}
                                className={cn(
                                    "flex items-center justify-start gap-5 px-4 py-2 rounded-lg hover:bg-muted/50",
                                    isCollapsed ? "ml-2" : "")}
                            >
                                {isCollapsed ? (
                                    <PanelLeftOpen className="h-4 w-4" />
                                ) : (
                                    <>
                                        <PanelLeftClose className="h-4 w-4" />
                                        <span>Recolher</span>
                                    </>
                                )}
                                <span className="sr-only">
                                    {isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
                                </span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Separador */}
                        <hr className="my-1 border-border" />

                        {/* Menu do Usuário */}
                        <SidebarMenuItem key="user-menu">
                            <SidebarMenuButton asChild>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center w-full hover:bg-muted/50 rounded-lg">
                                        <Avatar className="h-8 w-8 ml-2">
                                            <AvatarImage src={currentUser?.avatar || ''} />
                                            <AvatarFallback className="text-white bg-primary font-medium text-xs">
                                                {getUserInitials(currentUser?.name || '')}
                                            </AvatarFallback>
                                        </Avatar>

                                        {!isCollapsed && (
                                            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                                                <span className="truncate font-semibold">
                                                    {currentUser?.name || ''}
                                                </span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                </span>
                                            </div>
                                        )}
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        side="right"
                                        className="w-56 bg-popover border-border"
                                        sideOffset={8}
                                    >
                                        {/* User Info Header */}
                                        <div className="px-3 py-3">
                                            <p className="text-md font-semibold text-popover-foreground">
                                                {currentUser?.name || ''}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}
                                            </p>
                                        </div>

                                        <DropdownMenuSeparator className="bg-border" />

                                        {/* Profile Menu Item */}
                                        <DropdownMenuItem
                                            onClick={() => setProfileModalOpen(true)}
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            <span>Perfil</span>
                                        </DropdownMenuItem>

                                        {/* Dark Mode Toggle */}
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTheme(theme === 'dark' ? 'light' : 'dark');
                                            }}
                                        >
                                            {theme === 'dark' ? (
                                                <>
                                                    <Sun className="w-4 h-4 mr-2" />
                                                    <span>Modo Claro</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Moon className="w-4 h-4 mr-2" />
                                                    <span>Modo Escuro</span>
                                                </>
                                            )}
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-border" />

                                        {/* Logout Menu Item */}
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            <span>Sair</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarContent>
                </SidebarFooter>
            </SidebarPrimitive >
        </>
    )
}
