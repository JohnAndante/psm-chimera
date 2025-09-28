import { motion } from "framer-motion"

import ProfileModal from "@/components/layout/profile-modal"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/layout/sidebar/sidebar"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    const { isCollapsed } = useSidebarToggle()

    return (
        <ThemeProvider>
            <SidebarProvider>

                {/* Container principal com sidebar e conteúdo */}
                <div className="flex h-screen w-full">
                    {/* Sidebar */}
                    <Sidebar />
                    <ProfileModal />

                    {/* Conteúdo principal */}
                    <main className={`flex-1 w-full ${isCollapsed ? "" : "mr-2"}`}>
                        <motion.div
                            className="h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ScrollArea className="h-full w-full">
                                {children}
                            </ScrollArea>
                        </motion.div>
                    </main>
                </div>

                <Toaster />
            </SidebarProvider>
        </ThemeProvider>
    )
}
