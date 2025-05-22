import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AddToListDialog } from "@/app/contacts/_components/AddToListDialog"
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
import type { ColumnFiltersState } from "@tanstack/react-table";
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { Progress } from "@/components/ui/progress";

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
    selectedDate?: Date
    selectedDateRange?: { from: Date; to?: Date }
}

export function DataTable<TData, TValue>({
    refreshTrigger,
    onTotalContactsChange,
    searchQuery,
    onSelectionChange,
    selectedDate,
    selectedDateRange,
}: DataTableProps<TData, TValue>) {
    const [data, setData] = useState<TData[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [progressValue, setProgressValue] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setProgressValue(0);
            const interval = setInterval(() => {
                setProgressValue((old) => {
                    if (old >= 90) {
                        clearInterval(interval);
                        return old;
                    }
                    return old + 10;
                });
            }, 100);
            let data: any[]

            if (searchQuery && searchQuery.length >= 3) {
                const response = await supabase.rpc('search_contacts', { search_text: searchQuery })
                data = response.data
                const error = response.error
                const count = data ? data.length : 0
                if (!error && data) {
                    setData(data as TData[])
                    if (onTotalContactsChange) {
                        onTotalContactsChange(count)
                    }
                    setIsLoading(false);
                    setProgressValue(100);
                }
            } else {
                let response;
                if (selectedDateRange?.from && selectedDateRange.to) {
                    const from = selectedDateRange.from.toISOString().split("T")[0];
                    const to = selectedDateRange.to.toISOString().split("T")[0];
                    response = await supabase
                        .from('contacts')
                        .select(`
                            id,
                            firstname,
                            lastname,
                            email,
                            phone,
                            role,
                            created_at,
                            editeur,
                            support,
                            website,
                            organisation_id,
                            contact_type,
                            title,
                            gender,
                            salutation,
                            company_name,
                            language,
                            address,
                            zipcode,
                            secteur
                        `, { count: 'exact' })
                        .gte('created_at', from)
                        .lte('created_at', to)
                } else {
                    response = await supabase
                        .from('contacts')
                        .select(`
                            id,
                            firstname,
                            lastname,
                            email,
                            phone,
                            role,
                            created_at,
                            editeur,
                            support,
                            website,
                            organisation_id,
                            contact_type,
                            title,
                            gender,
                            salutation,
                            company_name,
                            language,
                            address,
                            zipcode,
                            secteur
                        `, { count: 'exact' })
                }
                data = response.data ?? []
                const error = response.error
                const count = response.count || 0
                if (!error && data) {
                    setData(data as TData[])
                    if (onTotalContactsChange) {
                        onTotalContactsChange(count)
                    }
                    setIsLoading(false);
                    setProgressValue(100);
                }
            }
        }
        fetchData()
    }, [refreshTrigger, searchQuery, selectedDate, selectedDateRange])

    // Recherche globale
    const [globalFilter, setGlobalFilter] = useState<string>("")
    // Tri
    const [sorting, setSorting] = useState<SortingState>([
      { id: "id", desc: true }
    ])
    // Sélection de lignes
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    // Affichage des colonnes
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
      support: false,
      created_at: false,
      role: false,
      website: false,
    })
    // Ordre des colonnes (drag & drop)
    const [columnOrder, setColumnOrder] = useState<string[]>([])
    // Filtres de colonnes
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    // Colonnes réduites pour les contacts
    const columns: ColumnDef<any>[] = [
      {
        accessorKey: "contact_type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.contact_type?.toLowerCase()
          const colorMap: Record<string, string> = {
            personne: "bg-blue-100 text-blue-800",
            person: "bg-blue-100 text-blue-800",
            organisation: "bg-purple-100 text-purple-800",
            organization: "bg-purple-100 text-purple-800",
          }
          const classes = colorMap[type] || "bg-gray-100 text-gray-800"
          return (
            <Badge className={`capitalize ${classes} hover:bg-inherit hover:text-inherit`}>
              {type || "N/A"}
            </Badge>
          )
        },
        enableHiding: true,
      },
      { 
        accessorKey: "id", 
        header: "ID",
        cell: ({ row }) => (
          <Link href={`/contacts/${row.original.id}`} className="hover:underline text-foreground">
            {row.original.id}
          </Link>
        )
      },
      { 
        accessorKey: "lastname", 
        header: "Nom",
        cell: ({ row }) => (
          <Link href={`/contacts/${row.original.id}`} className="hover:underline text-foreground">
            {row.original.lastname}
          </Link>
        )
      },
      { 
        accessorKey: "email", 
        header: "Email",
        cell: ({ row }) => (
          <Link href={`/contacts/${row.original.id}`} className="hover:underline text-foreground">
            {row.original.email}
          </Link>
        )
      },
      { accessorKey: "phone", header: "Téléphone" },
      {
        accessorKey: "company_name",
        header: "Société",
        cell: ({ row }) => {
          const name = row.original.company_name;
          const site = row.original.website;
          // Vérifie si site est un domaine valide (pas une URL complète)
          const isValidDomain =
            typeof site === "string" &&
            /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(site?.trim());
          return (
            <div className="flex items-center gap-2">
              {isValidDomain ? (
                <img
                  src={`https://logo.clearbit.com/${site.trim()}`}
                  alt={`Logo ${name}`}
                  className="w-5 h-5 rounded-sm border border-gray-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-logo.png";
                  }}
                />
              ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-sm border border-gray-200" />
              )}
              <span>{name}</span>
            </div>
          );
        }
      },
      { accessorKey: "secteur", header: "Secteur", enableHiding: true },
      { accessorKey: "support", header: "Support", enableHiding: true },
      {
        accessorKey: "role",
        header: "Rôle",
        enableHiding: true,
      },
      // Colonne website, masquée par défaut
      {
        accessorKey: "website",
        header: "Website",
        enableHiding: true,
      },
      {
          accessorKey: "created_at",
          header: "Créé le",
          enableHiding: true,
          filterFn: "includesString",
          cell: ({ getValue }) => {
              const value = getValue() as string
              return value ? formatDate(value) : "-"
          }
      },
    ]

    // Table
    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            rowSelection,
            columnVisibility,
            columnOrder,
            columnFilters,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        enableRowSelection: true,
        // getColumnOrder removed as requested
    })

    // Appel du callback onSelectionChange sur changement de sélection
    useEffect(() => {
        if (onSelectionChange) {
            const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as any).id)
            onSelectionChange(selectedIds)
        }
    }, [rowSelection, onSelectionChange])

    // Pour le menu d'affichage des colonnes (simple menu déroulant)
    const allColumns = table.getAllLeafColumns()

    // Barre d'actions si sélection
    const selectedRows = table.getSelectedRowModel().rows

    const [openDialog, setOpenDialog] = useState(false);

    // Pour le filtre secteur : opérateur et valeur
    const [sectorOperator, setSectorOperator] = useState("contains")
    const [sectorValue, setSectorValue] = useState("")

    return (
      <div className="flex gap-4">
        {/* Colonne de gauche : filtres */}
        <aside className="w-64 bg-muted px-4 py-6 text-sm space-y-4 rounded-md border border-border">
          <div>
            <h3 className="text-[13px] font-medium text-muted-foreground mb-2">Filtres enregistrés</h3>
            <Input placeholder="Tapez pour rechercher..." className="h-8 text-sm rounded-sm mb-2" />
            <div className="flex flex-col gap-1">
              <button
                className="text-sm text-foreground hover:bg-muted rounded px-2 py-1 text-left"
                onClick={() => setColumnFilters([])}
              >
                Tous les contacts
              </button>
              <button
                className="text-sm text-foreground hover:bg-muted rounded px-2 py-1 text-left"
                onClick={() => setColumnFilters([{ id: "role", value: "Journaliste" }])}
              >
                Tous les journalistes
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Collapsible>
              <CollapsibleTrigger className="w-full text-left text-[13px] font-medium text-muted-foreground flex items-center justify-between py-1.5 pl-3 hover:bg-accent rounded-sm transition">
                <span>Informations de contact</span>
                <span className="text-xl leading-none">+</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-3 mt-2 space-y-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-xs text-muted-foreground">Secteur d’activité</Label>
                  <Select value={sectorOperator} onValueChange={setSectorOperator}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contient</SelectItem>
                      <SelectItem value="not_contains">Ne contient pas</SelectItem>
                      <SelectItem value="is">Est exactement</SelectItem>
                      <SelectItem value="is_not">Est différent de</SelectItem>
                      <SelectItem value="is_known">Est renseigné</SelectItem>
                      <SelectItem value="is_unknown">N'est pas renseigné</SelectItem>
                    </SelectContent>
                  </Select>
                  {["contains", "not_contains", "is", "is_not"].includes(sectorOperator) && (
                    <Input
                      placeholder="ex: Agroalimentaire"
                      value={sectorValue}
                      onChange={(e) => setSectorValue(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <ul className="space-y-1">
                  <li className="text-xs">Profession (à venir)</li>
                  <li className="text-xs">Fonction (à venir)</li>
                  <li className="text-xs">Adresse (à venir)</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="w-full text-left text-[13px] font-medium text-muted-foreground flex items-center justify-between py-1.5 pl-3 hover:bg-accent rounded-sm transition">
                <span>Localisation</span>
                <span className="text-xl leading-none">+</span>
              </CollapsibleTrigger>
              {/* Ajoute ici CollapsibleContent si besoin */}
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="w-full text-left text-[13px] font-medium text-muted-foreground flex items-center justify-between py-1.5 pl-3 hover:bg-accent rounded-sm transition">
                <span>Autres filtres</span>
                <span className="text-xl leading-none">+</span>
              </CollapsibleTrigger>
              {/* Ajoute ici CollapsibleContent si besoin */}
            </Collapsible>
          </div>

          <div className="space-y-2">
            <button className="flex items-center justify-between w-full text-[13px] font-medium text-muted-foreground py-1.5 pl-3 hover:bg-accent rounded-sm transition">
              <span>Créé le</span>
              <span className="text-xl leading-none">+</span>
            </button>
            <button className="flex items-center justify-between w-full text-[13px] font-medium text-muted-foreground py-1.5 pl-3 hover:bg-accent rounded-sm transition">
              <span>Profils réseaux sociaux</span>
              <span className="text-xl leading-none">+</span>
            </button>
          </div>
        </aside>

        {/* Colonne de droite : tableau */}
        <div className="flex-1 rounded-md border border-border bg-muted/50 p-4 text-sm">
          {/* Barre de recherche globale */}
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
                          <span>
                            {flexRender(column.columnDef.header, {
                              table,
                              column,
                              header: { id: column.id } as any // minimal mock for HeaderContext
                            })}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenDialog(true)}
                disabled={selectedRows.length === 0}
              >
                Ajouter à une liste
              </Button>
              <Button variant="outline" size="sm">Exporter</Button>
            </div>
          </div>
          {/* Barre d'actions si sélection */}
          {selectedRows.length > 0 && (
              <div className="mb-2 p-2 bg-blue-50 border rounded flex items-center gap-2 text-sm">
                  {selectedRows.length} ligne{selectedRows.length > 1 ? "s" : ""} sélectionnée{selectedRows.length > 1 ? "s" : ""}
                  {/* Actions à ajouter ici, ex: bouton supprimer */}
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
                              {/* Checkbox pour sélectionner toutes les lignes */}
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
                                  <TableHead
                                    key={header.id}
                                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                    className={
                                      (header.column.getCanSort() ? "cursor-pointer select-none " : "") +
                                      "draggable-column"
                                    }
                                    draggable
                                    onDragStart={e => {
                                      e.dataTransfer.setData("col-id", header.column.id)
                                    }}
                                    onDragOver={e => {
                                      e.preventDefault()
                                    }}
                                    onDrop={e => {
                                      e.preventDefault()
                                      const fromId = e.dataTransfer.getData("col-id")
                                      const toId = header.column.id
                                      if (!fromId || fromId === toId) return
                                      const oldOrder = table.getState().columnOrder.length
                                        ? table.getState().columnOrder
                                        : table.getAllLeafColumns().map(col => col.id)
                                      const fromIdx = oldOrder.indexOf(fromId)
                                      const toIdx = oldOrder.indexOf(toId)
                                      if (fromIdx === -1 || toIdx === -1) return
                                      const newOrder = [...oldOrder]
                                      newOrder.splice(fromIdx, 1)
                                      newOrder.splice(toIdx, 0, fromId)
                                      setColumnOrder(newOrder)
                                    }}
                                  >
                                      {header.isPlaceholder
                                          ? null
                                          : (
                                              <span className="inline-flex items-center gap-1">
                                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                                  {/* Icône de tri */}
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
                                  {/* Checkbox pour sélectionner la ligne */}
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
          {/* Pagination */}
          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                  >
                      {"<<"}
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                  >
                      {"<"}
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                  >
                      {">"}
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                  >
                      {">>"}
                  </Button>
              </div>
              <span className="text-xs">
                  Page{" "}
                  <strong>
                      {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                  </strong>
              </span>
              <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={value => table.setPageSize(Number(value))}
              >
                  <SelectTrigger size="sm">
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
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <AddToListDialog
                onClose={() => setOpenDialog(false)}
                selectedContacts={selectedRows.map(row => row.original.id)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
}
