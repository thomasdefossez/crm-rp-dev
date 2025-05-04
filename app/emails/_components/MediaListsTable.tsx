'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface MediaList {
    id: number;
    name: string;
    created_at: string;
    contact_count: number;
}

interface MediaListsTableProps {
    onSelectionChange: (selected: number[]) => void;
    onRecipientsChange: (total: number) => void;
}

export function MediaListsTable({ onSelectionChange, onRecipientsChange }: MediaListsTableProps) {
    const [lists, setLists] = useState<MediaList[]>([]);
    const [selectedLists, setSelectedLists] = useState<number[]>([]);

    const fetchLists = async () => {
        const { data, error } = await supabase
            .from('lists')
            .select('id, name, created_at, contact_lists(count)')
            .order('created_at', { ascending: false });

        if (!error && data) {
            const formattedLists = data.map((list: any) => ({
                id: list.id,
                name: list.name,
                created_at: list.created_at,
                contact_count: list.contact_lists[0]?.count || 0,
            }));
            setLists(formattedLists);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        onSelectionChange(selectedLists);
        const total = lists
            .filter((list) => selectedLists.includes(list.id))
            .reduce((sum, list) => sum + list.contact_count, 0);
        onRecipientsChange(total);
    }, [selectedLists, lists, onSelectionChange, onRecipientsChange]);

    const toggleSelectList = (id: number) => {
        setSelectedLists((prev) =>
            prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
        );
    };

    const isAllSelected = lists.length > 0 && selectedLists.length === lists.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedLists([]);
        } else {
            setSelectedLists(lists.map((list) => list.id));
        }
    };

    return (
        <Table className="text-sm">
            <TableHeader>
                <TableRow className="h-12">
                    <TableHead>
                        <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead>Nom de la liste</TableHead>
                    <TableHead>Nombre de contacts</TableHead>
                    <TableHead>Date de création</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="text-gray-700">
                {lists.map((list) => (
                    <TableRow key={list.id} className="h-12 hover:bg-gray-50">
                        <TableCell>
                            <Checkbox
                                checked={selectedLists.includes(list.id)}
                                onCheckedChange={() => toggleSelectList(list.id)}
                            />
                        </TableCell>
                        <TableCell>
                            <span className="font-medium">{list.name}</span>
                        </TableCell>
                        <TableCell>{list.contact_count}</TableCell>
                        <TableCell>{new Date(list.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))}
                {lists.length === 0 && (
                    <TableRow className="h-12 hover:bg-gray-50">
                        <TableCell colSpan={4} className="text-center text-gray-500 text-sm">
                            Aucune liste trouvée.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}