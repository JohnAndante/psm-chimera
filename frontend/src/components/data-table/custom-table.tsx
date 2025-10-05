import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type PaginationState as TanstackPaginationState,
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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeftIcon, ChevronRightIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface DataTableProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    showPagination?: boolean
    skeletonRows?: number

    // Props para paginação server-side
    manualPagination?: boolean
    pageCount?: number
    totalRecords?: number
    pagination?: { page: number; limit: number }
    onPaginationChange?: (pagination: { page: number; limit: number }) => void

    // Props para ordenação server-side
    manualSorting?: boolean
    sorting?: SortingState
    onSortingChange?: (sorting: SortingState) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = false,
    className,
    isLoading,
    manualPagination = false,
    pageCount: controlledPageCount,
    totalRecords: controlledTotalRecords,
    pagination: controlledPagination,
    onPaginationChange,
    manualSorting = false,
    sorting: controlledSorting,
    onSortingChange,
    ...props
}: DataTableProps<TData, TValue>) {
    // Garantir que data é sempre um array
    const safeData = Array.isArray(data) ? data : [];

    // Estado interno de paginação (usado quando não é manual)
    const [internalPagination, setInternalPagination] = useState<TanstackPaginationState>({
        pageIndex: 0,
        pageSize: 10
    });

    // Estado interno de ordenação (usado quando não é manual)
    const [internalSorting, setInternalSorting] = useState<SortingState>([]);

    // Determinar qual estado usar (controlado ou interno)
    const pagination = manualPagination && controlledPagination
        ? { pageIndex: controlledPagination.page - 1, pageSize: controlledPagination.limit }
        : internalPagination;

    const sorting = manualSorting && controlledSorting
        ? controlledSorting
        : internalSorting;

    // Calcular pageCount baseado no modo
    const pageCount = manualPagination && controlledPageCount !== undefined
        ? controlledPageCount
        : Math.ceil(safeData.length / pagination.pageSize);

    // Total de registros
    const totalRecords = manualPagination && controlledTotalRecords !== undefined
        ? controlledTotalRecords
        : safeData.length;

    const table = useReactTable({
        data: safeData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),

        // Paginação
        manualPagination,
        pageCount,

        // Ordenação
        manualSorting,
        enableSorting: true,

        // Estados
        state: {
            pagination,
            sorting
        },

        // Callbacks de mudança de estado
        onPaginationChange: (updater) => {
            if (manualPagination && onPaginationChange) {
                const newPagination = typeof updater === 'function'
                    ? updater(pagination)
                    : updater;

                // Converter de volta para o formato do hook (page começa em 1)
                onPaginationChange({
                    page: newPagination.pageIndex + 1,
                    limit: newPagination.pageSize
                });
            } else {
                setInternalPagination(updater);
            }
        },

        onSortingChange: (updater) => {
            if (manualSorting && onSortingChange) {
                const newSorting = typeof updater === 'function'
                    ? updater(sorting)
                    : updater;

                onSortingChange(newSorting.map(s => ({
                    id: s.id,
                    desc: s.desc
                })));
            } else {
                setInternalSorting(updater);
            }
        }
    })

    const rowModel = table.getRowModel();
    const rows = rowModel?.rows || [];

    const renderSkeletonRows = () => {
        return Array.from({ length: pagination.pageSize }, (_, index) => (
            <motion.tr
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    delay: 0.1,
                }}
                className="hover:bg-muted/50 transition-colors"
            >
                {columns.map((_column, colIndex) => (
                    <TableCell key={colIndex}>
                        <Skeleton
                            className={cn(
                                "h-6",
                                colIndex === 0 ? "w-32" :
                                    colIndex === columns.length - 1 ? "w-20" :
                                        "w-24"
                            )}
                        />
                    </TableCell>
                ))}
            </motion.tr>
        ))
    }

    const renderDataRows = () => {
        if (!isLoading && rows.length === 0) {
            return (
                <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <TableCell colSpan={columns.length} className="h-36 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                                className="rounded-full p-2 bg-muted"
                            >
                                <File className="w-6 h-6" />
                            </motion.div>
                            <span>Nenhum dado disponível</span>
                        </div>
                    </TableCell>
                </motion.tr>
            )
        }

        return rows.map((row, index) => (
            <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                className="hover:bg-muted/80 transition-all duration-200 cursor-default"
                data-state={row.getIsSelected() && "selected"}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell
                        key={cell.id}
                        className={cn(
                            "py-1",
                            cell.column.id === columns[0].id ? "pl-4" : undefined
                        )}
                    >
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
            <TooltipProvider>
                <div className={cn("border rounded-md", className)} {...props}>
                    <Table className="w-full overflow-hidden">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup, index) => (
                                <motion.tr
                                    key={headerGroup.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    {headerGroup.headers.map((header) => {
                                        const canSort = header.column.getCanSort();
                                        const isSorted = header.column.getIsSorted();

                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "h-10 text-left align-middle hover:bg-muted transition-colors",
                                                    canSort && "cursor-pointer",
                                                    header.column.id === columns[0].id ? "pl-4" : undefined
                                                )}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={cn(
                                                                    "flex items-center gap-2",
                                                                    canSort && "cursor-pointer select-none hover:text-foreground transition-colors"
                                                                )}
                                                                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {canSort && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        {isSorted === "desc" ? (
                                                                            <ArrowDown className="w-4 h-4" />
                                                                        ) : isSorted === "asc" ? (
                                                                            <ArrowUp className="w-4 h-4" />
                                                                        ) : (
                                                                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        {canSort && (
                                                            <TooltipContent>
                                                                {isSorted === "desc"
                                                                    ? "Ordenado: Z-A / Maior-Menor"
                                                                    : isSorted === "asc"
                                                                        ? "Ordenado: A-Z / Menor-Maior"
                                                                        : "Clique para ordenar"}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                )}
                                            </TableHead>
                                        );
                                    })}

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
                        className="flex w-full items-center justify-between mt-4 "
                    >
                        {/* Total de registros */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 text-sm text-muted-foreground"
                        >
                            {isLoading ? (
                                <Skeleton className="h-4 w-32" />
                            ) : (
                                `Total de ${totalRecords} registro${totalRecords !== 1 ? 's' : ''}`
                            )}
                        </motion.div>

                        {/* Botões de paginação numérica */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: isLoading ? 0 : 0.4 }}
                            className="flex flex-1 items-center justify-center gap-1"
                        >
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </>
                            ) : (
                                <>
                                    {/* Botão anterior */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </Button>

                                    {/* Botões de página numérica */}
                                    {(() => {
                                        const currentPage = table.getState().pagination.pageIndex + 1;
                                        const totalPages = table.getPageCount();
                                        const pages: (number | string)[] = [];

                                        if (totalPages <= 7) {
                                            // Mostrar todas as páginas se forem 7 ou menos
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // Lógica para muitas páginas
                                            if (currentPage <= 3) {
                                                // Início: 1 2 3 4 ... 10
                                                pages.push(1, 2, 3, 4, '...', totalPages);
                                            } else if (currentPage >= totalPages - 2) {
                                                // Fim: 1 ... 7 8 9 10
                                                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                            } else {
                                                // Meio: 1 ... 4 5 6 ... 10
                                                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                            }
                                        }

                                        return pages.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const pageNumber = page as number;
                                            const isCurrentPage = pageNumber === currentPage;

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={isCurrentPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => table.setPageIndex(pageNumber - 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        });
                                    })()}

                                    {/* Botão próximo */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </motion.div>

                        {/* Seletor de limite (direita) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: isLoading ? 0 : 0.5 }}
                            className="flex flex-1 items-center justify-end gap-2"
                        >
                            {isLoading ? (
                                <Skeleton className="h-6 w-[180px]" />
                            ) : (
                                <>
                                    <Label
                                        className="text-sm text-muted-foreground whitespace-nowrap"
                                        htmlFor="page-size"
                                    >
                                        Registros por página
                                    </Label>
                                    <Select
                                        value={table.getState().pagination.pageSize.toString()}
                                        onValueChange={(value) => {
                                            table.setPageSize(Number(value))
                                        }}
                                    >
                                        <SelectTrigger className="max-h-8 w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="30">30</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </TooltipProvider>
        </motion.div>
    )
}
