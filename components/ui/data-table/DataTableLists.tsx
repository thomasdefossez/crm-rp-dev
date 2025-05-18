"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface ListItem {
  id: string;
  name: string;
  created_at: string;
}

export function DataTableLists() {
  const [data, setData] = useState<ListItem[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
          .from("lists")
          .select("*")
          .order("created_at", { ascending: false });
      if (!error && data) {
        setData(data);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    const { data: newList, error } = await supabase
        .from("lists")
        .insert({ name: newListName })
        .select()
        .single();
    if (!error && newList) {
      setData((prev) => [newList, ...prev]);
      setNewListName("");
      setOpen(false);
    }
  };

  const columns: ColumnDef<ListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
          <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Tout sélectionner"
          />
      ),
      cell: ({ row }) => (
          <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Sélectionner"
          />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "created_at",
      header: "Créée le",
      cell: ({ row }) =>
          format(new Date(row.original.created_at), "dd/MM/yyyy"),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const allColumns = table.getAllLeafColumns();

  return (
      <div className="max-w-7xl mx-auto p-4 bg-muted/50 border rounded-md text-sm">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher une liste..."
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
                    {table.getFlatHeaders().map(header => (
                        <CommandItem
                            key={header.id}
                            onSelect={() => header.column.toggleVisibility()}
                            className="flex items-center gap-2"
                        >
                          <Checkbox
                              checked={header.column.getIsVisible()}
                              onCheckedChange={() => header.column.toggleVisibility()}
                              className="pointer-events-none"
                          />
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => setOpen(true)}
            >
              + Créer une liste
            </Button>
            <Button variant="outline" size="sm">Exporter</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                      </TableHead>
                  ))}
                </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                      ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    Aucune liste pour le moment.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} liste(s)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Suivant
            </Button>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle liste</DialogTitle>
            </DialogHeader>
            <Input
                placeholder="Nom de la liste"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="mt-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}