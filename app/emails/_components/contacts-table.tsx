'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactsTableProps {
    refreshTrigger: number;
    onTotalContactsChange: (total: number) => void;
    searchQuery?: string;
    onSelectionChange?: (selected: string[]) => void; // <-- Ajout
}

export function ContactsTable({ refreshTrigger, onTotalContactsChange, searchQuery, onSelectionChange }: ContactsTableProps) {
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const fetchContacts = async () => {
        const safeSearch = typeof searchQuery === 'string' ? searchQuery : '';

        let data: any[] = [];
        let error = null;
        let count = 0;

        if (safeSearch.length >= 3) {
            const response = await supabase.rpc('search_contacts', { search_text: safeSearch });
            data = Array.isArray(response.data) ? response.data : [];
            error = response.error;
            count = data.length;
        } else {
            const response = await supabase.from('contacts').select('*', { count: 'exact' });
            data = Array.isArray(response.data) ? response.data : [];
            error = response.error;
            count = response.count || 0;
        }

        if (!error) {
            setContacts(data || []);
            onTotalContactsChange(count);
            setSelectedContacts([]); // Reset sélection si liste change
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [refreshTrigger, searchQuery]);

    // Envoie les contacts sélectionnés au parent
    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedContacts);
        }
    }, [selectedContacts, onSelectionChange]);

    const toggleSelectContact = (id: string) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map((contact) => contact.id));
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Support</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                        <TableCell>
                            <Checkbox
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={() => toggleSelectContact(contact.id)}
                            />
                        </TableCell>
                        <TableCell>
                            <Link href={`/contacts/${contact.id}`} className="hover:underline">
                                {contact.firstname} {contact.lastname}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <Link href={`/contacts/${contact.id}`} className="hover:underline">
                                {contact.email}
                            </Link>
                        </TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell>{contact.organization || '-'}</TableCell>
                        <TableCell>{contact.support || '-'}</TableCell>
                    </TableRow>
                ))}
                {contacts.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 text-sm">
                            Aucun contact trouvé.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}