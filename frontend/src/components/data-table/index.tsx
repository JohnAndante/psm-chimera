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
} from "@/components/ui/table"

import { cn } from "@/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

interface DataTableProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    showPagination?: boolean
    skeletonRows?: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = false,
    className,
    isLoading,
    skeletonRows = 5,
    ...props
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const renderSkeletonRows = () => {
        return Array.from({ length: skeletonRows }, (_, index) => (
            <motion.tr
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut"
                }}
                className="hover:bg-muted/50 transition-colors"
            >
                {columns.map((_column, colIndex) => (
                    <TableCell key={colIndex}>
                        <Skeleton
                            className={cn(
                                "h-4",
                                // Varia a largura dos skeletons para parecer mais natural
                                colIndex === 0 ? "w-32" : // Nome/ID mais largo
                                    colIndex === columns.length - 1 ? "w-20" : // Ações mais estreito
                                        "w-24" // Tamanho médio para outros campos
                            )}
                        />
                    </TableCell>
                ))}
            </motion.tr>
        ))
    }

    const renderDataRows = () => {
        if (!isLoading && table.getRowModel().rows.length === 0) {
            return (
                <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                📄
                            </motion.div>
                            <span>Nenhum dado disponível</span>
                        </div>
                    </TableCell>
                </motion.tr>
            )
        }

        return table.getRowModel().rows.map((row, index) => (
            <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                }}
                className="hover:bg-muted/50 transition-colors"
                whileHover={{
                    backgroundColor: "rgba(var(--muted), 0.8)",
                    transition: { duration: 0.15 }
                }}
                data-state={row.getIsSelected() && "selected"}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </motion.div>
                    </TableCell>
                ))}
            </motion.tr>
        ))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className={cn("border rounded-md", className)} {...props}>
                <Table className="w-full">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup, index) => (
                            <motion.tr
                                key={headerGroup.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </motion.tr>
                        ))}
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="sync">
                            {isLoading ? renderSkeletonRows() : renderDataRows()}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-between space-x-2 mt-4 px-2"
                >
                    <motion.div
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {isLoading ? (
                            <Skeleton className="h-4 w-32" />
                        ) : (
                            `Total de ${table.getRowModel().rows.length} registros`
                        )}
                    </motion.div>

                    <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {isLoading ? (
                            <>
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8" />
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="transition-all duration-200 hover:scale-105"
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
                                    className="transition-all duration-200 hover:scale-105"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    )
}
