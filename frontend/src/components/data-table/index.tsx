import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "../ui/separator"

interface DataTableProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    showPagination?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = false,
    className,
    isLoading,
    ...props
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <>
            <div className={cn("overflow-hidden border rounded-md", className)} {...props}>
                <Table className="w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                                )}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {!isLoading && table.getRowModel().rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <span>Nenhum dado disponível</span>
                                </TableCell>
                            </TableRow>
                        )}

                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Carregando...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>


            {showPagination && !isLoading && (
                <>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="text-sm">
                            Total de {table.getRowModel().rows.length} registros
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-4" />
                </>
            )}

        </>
    )
}
