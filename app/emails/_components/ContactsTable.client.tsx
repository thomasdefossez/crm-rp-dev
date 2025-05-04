'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Contact = {
    id: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    avatar_url?: string;
    company_name?: string;
};

type ContactsTableProps = {
    refreshTrigger: number;
    onTotalContactsChange?: (total: number) => void;
    filterUpdatedSince?: number;
};

export default function ContactsTable({ refreshTrigger, onTotalContactsChange, filterUpdatedSince }: ContactsTableProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalContacts, setTotalContacts] = useState(0);

    useEffect(() => {
        const fetchContacts = async () => {
            const { supabase } = await import('@/lib/supabaseClient');
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('contacts')
                .select('*', { count: 'exact' })
                .range(from, to);

            if (filterUpdatedSince) {
                const sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - filterUpdatedSince);
                query = query.gte('updated_at', sinceDate.toISOString());
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Erreur chargement contacts', error);
            } else {
                setContacts(data || []);
                setTotalContacts(count || 0);
                if (onTotalContactsChange) {
                    onTotalContactsChange(count || 0);
                }
            }
        };

        fetchContacts();
    }, [refreshTrigger, currentPage, pageSize, onTotalContactsChange, filterUpdatedSince]);

    return (
        <div className="rounded-lg border bg-white">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr] items-center px-4 py-2 border-b bg-muted text-xs font-semibold text-muted-foreground uppercase">
                <div>
                    <Checkbox />
                </div>
                <div>Nom</div>
                <div>Entreprise</div>
                <div>Email</div>
            </div>

            {contacts.map((contact) => (
                <div
                    key={contact.id}
                    className="grid grid-cols-[40px_1fr_1fr_1fr] items-center px-4 py-3 border-b hover:bg-muted/50 transition"
                >
                    <div>
                        <Checkbox />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-900">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={contact.avatar_url || ''} />
                            <AvatarFallback>
                                {(contact.firstname?.[0] || '').toUpperCase()}
                                {(contact.lastname?.[0] || '').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Link href={`/contacts/${contact.id}`} className="font-medium text-primary hover:underline">
                            {contact.firstname} {contact.lastname}
                        </Link>
                    </div>
                    <div className="text-sm text-gray-900">{contact.company_name || '—'}</div>
                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                </div>
            ))}

            <div className="flex items-center justify-between px-4 py-2 bg-muted text-sm text-muted-foreground">
                <div>
                    {totalContacts} contacts • Page {currentPage} sur {Math.max(1, Math.ceil(totalContacts / pageSize))}
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                prev < Math.ceil(totalContacts / pageSize) ? prev + 1 : prev
                            )
                        }
                        disabled={currentPage === Math.ceil(totalContacts / pageSize)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </div>
    );
}
