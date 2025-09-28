import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle"

interface Crumb {
    label: string
    to?: string
}

interface PageContainerProps {
    title: string
    subtitle?: string
    breadcrumbs?: Crumb[]
    extra?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

export function PageContainer({
    title,
    subtitle,
    breadcrumbs,
    extra,
    children,
    className,
}: PageContainerProps) {
    const { isCollapsed } = useSidebarToggle()

    return (
        <>
            <Card
                className={cn(
                    "mx-auto flex w-full min-w-0 flex-1 flex-col gap-4 p-4 rounded-none border-t-0 rounded-b-2xl",
                    isCollapsed
                        ? "max-w-7xl xl:max-w-8xl lg:max-w-7xl md:max-w-6xl sm:max-w-5xl"
                        : "max-w-2xl xl:max-w-6xl lg:max-w-5xl md:max-w-4xl sm:max-w-3xl",
                    className,
                )}
            >
                <CardHeader>
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((bc, index) => {
                                    const isLast = index === breadcrumbs.length - 1

                                    return (
                                        <BreadcrumbItem key={index}>
                                            {bc.to ? (
                                                <BreadcrumbLink asChild>
                                                    <Link to={bc.to} className={`hover:underline ${isLast ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {bc.label}
                                                    </Link>
                                                </BreadcrumbLink>
                                            ) : (
                                                <BreadcrumbPage className={`${isLast ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {bc.label}
                                                </BreadcrumbPage>
                                            )}

                                            {!isLast && <BreadcrumbSeparator />}
                                        </BreadcrumbItem>
                                    )
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-h-20">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
                            )}
                        </div>
                        {extra && <div className="mt-2 sm:mt-0">{extra}</div>}
                    </div>
                </CardContent>
            </Card>


            {/* Conteúdo */}
            <div className={cn(
                "mx-auto mt-4 w-full max-w-5xl min-w-0 flex-1",
                isCollapsed
                    ? "xl:max-w-7xl lg:max-w-6xl md:max-w-5xl sm:max-w-4xl"
                    : "max-w-2xl xl:max-w-6xl lg:max-w-5xl md:max-w-4xl sm:max-w-3xl",
            )}>
                {children}
            </div>
        </>
    )
}
