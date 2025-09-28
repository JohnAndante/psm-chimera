import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageCard({
    cardTitle,
    cardExtra,
    children,
    className,
}: {
    cardTitle?: string
    cardExtra?: React.ReactNode
    children?: React.ReactNode
    className?: React.HTMLAttributes<HTMLDivElement>['className']
}) {
    return (
        <Card className={cn(
            "px-4 py-6",
            className,
        )}>
            {/* Título do card */}
            {(cardTitle || cardExtra) && (
                <CardHeader
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                    {cardTitle && <CardTitle className="text-lg font-medium">{cardTitle}</CardTitle>}
                    {cardExtra && <div>{cardExtra}</div>}
                </CardHeader>
            )}

            {/* Conteúdo */}
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}
