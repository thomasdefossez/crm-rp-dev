'use client';

import { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface AddToListDialogProps {
    onClose?: () => void;
    selectedContacts?: number[];
}

export function AddToListDialog({ onClose, selectedContacts = [] }: AddToListDialogProps) {
    const [lists, setLists] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [creating, setCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    useEffect(() => {
        if (creating) return;
        const fetchLists = async () => {
            let query = supabase
                .from('lists')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);

            if (searchTerm.trim().length >= 3) {
                query = supabase
                    .from('lists')
                    .select('*')
                    .ilike('name', `%${searchTerm}%`)
                    .order('created_at', { ascending: false });
            }

            const { data, error } = await query;
            if (!error) {
                setLists(data);
            }
        };

        fetchLists();
    }, [searchTerm, creating]);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        const { data, error } = await supabase
            .from('lists')
            .insert({ name: newListName })
            .select()
            .single();

        if (!error && data) {
            setCreating(false);
            setNewListName('');
            setSearchTerm('');
            setLists([data, ...lists]);
        }
    };

    const handleAddToList = async () => {
        if (!selectedListId || selectedContacts.length === 0) return;

        // Insertion dans contact_lists
        const contactInserts = selectedContacts.map((contactId) => ({
            list_id: selectedListId,
            contact_id: contactId,
        }));

        const { error: contactInsertError } = await supabase
            .from('contact_lists')
            .insert(contactInserts);

        if (contactInsertError) {
            toast.error('Erreur lors de l’ajout à la liste');
            return;
        }

        // Récupération des organisations associées aux contacts
        const { data: contactsData, error: contactsFetchError } = await supabase
            .from('contacts')
            .select('id, organisation_id')
            .in('id', selectedContacts);

        if (contactsFetchError || !contactsData) {
            toast.warning('Contacts ajoutés, mais échec récupération des organisations');
            onClose?.();
            return;
        }

        // Extraction des couples uniques organisation_id / list_id
        const organisationInserts = contactsData
            .filter(c => c.organisation_id !== null)
            .map(c => ({
                organisation_id: c.organisation_id,
                list_id: selectedListId,
            }));

        // Filtrage pour éviter doublons (uniques)
        const uniqueInserts = Array.from(
            new Map(organisationInserts.map(item => [item.organisation_id + '_' + item.list_id, item])).values()
        );

        if (uniqueInserts.length > 0) {
            const { error: orgInsertError } = await supabase
                .from('organisation_lists')
                .insert(uniqueInserts);

            if (orgInsertError) {
                toast.warning('Contacts ajoutés, mais erreur ajout organisations');
            }
        }

        toast.success('Contacts ajoutés à la liste avec succès');
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <DialogHeader>
                <div className="flex items-center justify-between">
                    <DialogTitle>{creating ? 'Create new list' : 'Add to list'}</DialogTitle>
                    {!creating && (
                        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
                            New list
                        </Button>
                    )}
                </div>
            </DialogHeader>

            {creating ? (
                <div className="space-y-4">
                    <Input
                        placeholder="List name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setCreating(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateList}>Créer nouvelle liste</Button>
                    </div>
                </div>
            ) : (
                <>
                    <Input
                        placeholder="Search lists"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="space-y-2">
                        {lists.map((list) => (
                            <div
                                key={list.id}
                                onClick={() => setSelectedListId(list.id)}
                                className={`border rounded px-4 py-2 text-sm flex justify-between cursor-pointer ${
                                    selectedListId === list.id ? 'border-violet-600 bg-violet-50' : 'text-gray-700'
                                }`}
                            >
                                <span>{list.name}</span>
                                <span className="text-gray-400 text-xs">
                                    {new Date(list.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleAddToList} disabled={!selectedListId}>
                            Ajouter à la liste
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}