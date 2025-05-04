"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient"; // ✅ IMPORT CORRIGÉ

export function ListsTable() {
    const [lists, setLists] = useState<any[]>([]);

    useEffect(() => {
        const fetchLists = async () => {
            const { data, error } = await supabase
                .from("lists")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setLists(data);
            }
        };
        fetchLists();
    }, []);

    return (
        <div className="border rounded-md p-4 bg-muted/50 text-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Créée le</TableHead>
                        <TableHead className="w-20 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lists.map((list) => (
                        <TableRow key={list.id}>
                            <TableCell>{list.name}</TableCell>
                            <TableCell>
                                {list.created_at
                                    ? format(new Date(list.created_at), "dd/MM/yyyy")
                                    : "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <button className="text-blue-600 hover:underline text-sm">
                                    Voir
                                </button>
                                <button className="text-red-600 hover:underline text-sm">
                                    🗑️
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {lists.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                Aucune liste pour le moment.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}