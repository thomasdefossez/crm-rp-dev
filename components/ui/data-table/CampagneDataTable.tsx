import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    useReactTable,
    ColumnDef,
    RowSelectionState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { Progress } from "@/components/ui/progress"

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

interface DataTableProps<TData, TValue> {
    refreshTrigger: number
    onTotalContactsChange?: (total: number) => void
    searchQuery?: string
    onSelectionChange?: (selectedIds: string[]) => void
    tableName?: string
}

export function DataTable<TData, TValue>({
                                             refreshTrigger,
                                             onTotalContactsChange,
                                             searchQuery,
                                             onSelectionChange,
                                         }: DataTableProps<TData, TValue>) {
    const [data, setData] = useState<TData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [progressValue, setProgressValue] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            setProgressValue(0)
            const interval = setInterval(() => {
                setProgressValue((old) => {
                    if (old >= 90) {
                        clearInterval(interval)
                        return old
                    }
                    return old + 10
                })
            }, 100)

            const response = await supabase
                .from('campaigns')
                .select(`
                    id,
                    name,
                    created_at,
                    updated_at,
                    user_id,
                    description
                `, { count: 'exact' })
                .order('created_at', { ascending: false })

            const { data, error, count } = response

            if (!error && data) {
                setData(data as TData[])
                if (onTotalContactsChange) {
                    onTotalContactsChange(count || 0)
                }
                setIsLoading(false)
                setProgressValue(100)
            }
        }
        fetchData()
    }, [refreshTrigger, searchQuery])

    const [globalFilter, setGlobalFilter] = useState<string>("")
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Nom",
            cell: ({ row }) => (
                <Link
                    href={`/emails/campagne/addcampagne?id=${row.original.id}`}
                    className="text-purple-600 hover:underline font-medium"
                >
                    {row.original.name || "-"}
                </Link>
            )
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.description || "-"}</span>
            )
        },
        {
            accessorKey: "user_id",
            header: "Utilisateur",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.user_id || "-"}</span>
            )
        },
        {
            accessorKey: "created_at",
            header: "Créée le",
            cell: ({ getValue }) => {
                const value = getValue() as string
                return value ? formatDate(value) : "-"
            }
        },
        {
            accessorKey: "updated_at",
            header: "Modifiée le",
            cell: ({ getValue }) => {
                const value = getValue() as string
                return value ? formatDate(value) : "-"
            }
        }
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            rowSelection,
            columnVisibility,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        enableRowSelection: true,
    })

    useEffect(() => {
        if (onSelectionChange) {
            const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as any).id)
            onSelectionChange(selectedIds)
        }
    }, [rowSelection, onSelectionChange])

    const allColumns = table.getAllLeafColumns()
    const selectedRows = table.getSelectedRowModel().rows

    return (
        <div className="rounded-md border border-border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <Input
                    value={globalFilter ?? ""}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-64"
                />
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">Colonnes</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher une colonne..." />
                                <CommandEmpty>Aucune colonne trouvée.</CommandEmpty>
                                <CommandGroup>
                                    {allColumns.map(column => (
                                        <CommandItem
                                            key={column.id}
                                            onSelect={() => column.toggleVisibility()}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={column.getIsVisible()}
                                                onCheckedChange={() => column.toggleVisibility()}
                                                className="pointer-events-none"
                                            />
                                            <span>{flexRender(column.columnDef.header, {
                                                table,
                                                column,
                                                header: {
                                                    id: column.id,
                                                    column,
                                                    getContext: () => ({ table, column, header: undefined })
                                                } as any
                                            })}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {selectedRows.length > 0 && (
                <div className="mb-2 p-2 bg-blue-50 border rounded flex items-center gap-2 text-sm">
                    {selectedRows.length} ligne{selectedRows.length > 1 ? "s" : ""} sélectionnée{selectedRows.length > 1 ? "s" : ""}
                </div>
            )}
            {isLoading && (
                <div className="mb-4">
                    <Progress
                        value={progressValue}
                        className="h-1 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] transition-all duration-300"
                    />
                </div>
            )}
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                <TableHead key="select-all" className="w-8">
                                    <Checkbox
                                        checked={table.getIsAllPageRowsSelected()}
                                        onCheckedChange={() => table.toggleAllPageRowsSelected()}
                                        ref={(ref) => {
                                            if (ref) {
                                                const input = ref as HTMLInputElement;
                                                input.indeterminate = table.getIsSomePageRowsSelected();
                                            }
                                        }}
                                        className="bg-white data-[state=checked]:bg-primary border border-gray-300 data-[state=checked]:border-primary"
                                    />
                                </TableHead>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                               className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : (
                                                <span className="inline-flex items-center gap-1">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && (
                                                        <span>
                                                            {{
                                                                asc: "▲",
                                                                desc: "▼"
                                                            }[header.column.getIsSorted() as string] ?? ""}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    <TableCell className="w-8">
                                        <Checkbox
                                            checked={row.getIsSelected()}
                                            disabled={!row.getCanSelect()}
                                            onCheckedChange={() => row.toggleSelected()}
                                        />
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                                    Aucun résultat
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>{"<<"}</Button>
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{"<"}</Button>
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{">"}</Button>
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>{">>"}</Button>
                </div>
                <span className="text-xs">
                    Page <strong>{table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</strong>
                </span>
                <Select
                    value={table.getState().pagination.pageSize.toString()}
                    onValueChange={value => table.setPageSize(Number(value))}
                >
                    <SelectTrigger size="sm" className="w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 20, 30, 50, 100].map(pageSize => (
                            <SelectItem key={pageSize} value={pageSize.toString()}>
                                {pageSize} lignes
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}