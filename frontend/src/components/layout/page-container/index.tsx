import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

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
    return (
        <Card
            className={cn(
                "mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col gap-4 p-4",
                className,
            )}
        >
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

            {/* Header da página */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-h-20 ">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
                    )}
                </div>
                {extra && <div className="mt-2 sm:mt-0">{extra}</div>}
            </div>

            <Separator className="my-2" />

            {/* Conteúdo */}
            <div>{children}</div>
        </Card>
    )
}
