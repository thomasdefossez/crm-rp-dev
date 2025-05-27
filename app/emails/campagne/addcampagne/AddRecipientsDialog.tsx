'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { FolderOpen, User } from 'lucide-react';
import { toast } from 'sonner'; // 👈 Toast import

interface Recipient {
    id: number;
    type: 'List' | 'Contact';
    name: string;
    email?: string;
    inclusion: 'Include' | 'Exclude';
}

export default function AddRecipientsDialog({
    open,
    onOpenChange,
    onAddRecipients,
    descriptionId, // 👈 ajouté ici
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddRecipients: (recipients: Recipient[]) => void;
    descriptionId: string; // 👈 ajouté ici
}) {
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);

    // 🔥 Fetch lists + contacts Supabase
    useEffect(() => {
        const fetchData = async () => {
            const { data: listsData } = await supabase.from('lists').select('id, name');
            const { data: contactsData } = await supabase.from('contacts').select('id, firstname, lastname, email');

            const formattedLists = (listsData || []).map((list: any) => ({
                id: list.id,
                type: 'List' as const,
                name: list.name,
                inclusion: 'Include' as const,
            }));

            const formattedContacts = (contactsData || []).map((contact: any) => ({
                id: contact.id,
                type: 'Contact' as const,
                name: `${contact.firstname} ${contact.lastname}`,
                email: contact.email,
                inclusion: 'Include' as const,
            }));

            setRecipients([...formattedLists, ...formattedContacts]);
        };

        if (open) fetchData();
    }, [open]);

    const filteredRecipients = recipients.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleRecipient = (recipient: Recipient) => {
        const exists = selectedRecipients.find((r) => r.id === recipient.id && r.type === recipient.type);
        if (exists) {
            setSelectedRecipients(selectedRecipients.filter((r) => r.id !== recipient.id || r.type !== recipient.type));
        } else {
            setSelectedRecipients([...selectedRecipients, recipient]);
        }
    };

    const toggleInclusion = (recipientId: number, type: 'List' | 'Contact') => {
        setSelectedRecipients((prev) =>
            prev.map((r) =>
                r.id === recipientId && r.type === type
                    ? { ...r, inclusion: r.inclusion === 'Include' ? 'Exclude' : 'Include' }
                    : r
            )
        );
    };

    const handleConfirm = () => {
        console.log('Destinataires sélectionnés :', selectedRecipients);
        onAddRecipients(selectedRecipients);
        toast.success(`${selectedRecipients.length} destinataire(s) ajouté(s) avec succès 🎉`); // 👈 Toast ici
        setSelectedRecipients([]);
        setSearchQuery('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={descriptionId}>
                <DialogHeader>
                    <DialogTitle>Ajouter des destinataires</DialogTitle>
                </DialogHeader>
                <p id={descriptionId} className="text-sm text-gray-500">
                    Sélectionnez des contacts ou des listes à ajouter comme destinataires.
                </p>

                {/* Search */}
                <Input
                    placeholder="Rechercher des listes ou contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />

                {/* Results */}
                <div className="space-y-2 max-h-60 overflow-auto text-sm">
                    {filteredRecipients.map((recipient) => {
                        const isSelected = selectedRecipients.some((r) => r.id === recipient.id && r.type === recipient.type);
                        const selectedRecipient = selectedRecipients.find((r) => r.id === recipient.id && r.type === recipient.type);

                        const icon =
                            recipient.type === 'List' ? (
                                <FolderOpen className="w-4 h-4 text-purple-600" />
                            ) : (
                                <User className="w-4 h-4 text-blue-600" />
                            );

                        return (
                            <div
                                key={`${recipient.type}-${recipient.id}`}
                                className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer ${
                                    isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                                }`}
                                onClick={() => toggleRecipient(recipient)}
                            >
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <div>
                                        <div className="font-medium">{recipient.name}</div>
                                        <div className={`text-xs ${recipient.type === 'List' ? 'text-purple-600' : 'text-blue-600'}`}>
                                            {recipient.type}
                                        </div>
                                    </div>
                                </div>
                                {isSelected && (
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer ${
                                            selectedRecipient?.inclusion === 'Include'
                                                ? 'border-green-500 text-green-500'
                                                : 'border-red-500 text-red-500'
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleInclusion(recipient.id, recipient.type);
                                        }}
                                    >
                                        {selectedRecipient?.inclusion}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Confirm */}
                <div className="flex justify-end pt-4">
                    <Button
                        disabled={selectedRecipients.length === 0}
                        onClick={handleConfirm}
                    >
                        Ajouter {selectedRecipients.length} destinataire(s)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}