import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageCard({
    cardTitle,
    cardExtra,
    children
}: {
    cardTitle?: string
    cardExtra?: React.ReactNode
    children?: React.ReactNode
}) {
    return (
        <Card className="px-4 py-6">
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
