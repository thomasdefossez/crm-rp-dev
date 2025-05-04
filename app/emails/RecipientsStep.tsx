'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, AlertCircle, CheckCircle, Lightbulb, Paperclip } from 'lucide-react';
import AddRecipientsDialog from './AddRecipientsDialog';

interface Recipient {
    id: number;
    type: 'Contact' | 'List' | 'Filter';
    name: string;
    inclusion: 'Include' | 'Exclude';
}

export default function RecipientsStep() {
    const [activeTab, setActiveTab] = useState<'select' | 'review'>('select');
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddRecipients = (newRecipients: Recipient[]) => {
        // Eviter les doublons
        const unique = [
            ...recipients,
            ...newRecipients.filter((nr) => !recipients.some((r) => r.id === nr.id)),
        ];
        setRecipients(unique);
    };

    const errorCount = recipients.length === 0 ? 1 : 0;
    const doneCount = recipients.length;
    const suggestionCount = 0;

    return (
        <div className="flex flex-1">
            {/* Colonne gauche */}
            <div className="flex-1 border-r p-8">
                <h1 className="text-2xl font-bold mb-6">Select recipients</h1>

                {/* Tabs */}
                <div className="flex border-b mb-4 text-sm">
                    <button
                        onClick={() => setActiveTab('select')}
                        className={`mr-6 pb-2 ${
                            activeTab === 'select'
                                ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
                                : 'text-gray-600'
                        }`}
                    >
                        Select recipients
                    </button>
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`pb-2 ${
                            activeTab === 'review'
                                ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
                                : 'text-gray-600'
                        }`}
                    >
                        Review selected recipients ({recipients.length})
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        Type
                        <ChevronDown className="w-4 h-4" />
                        <span className="font-medium text-gray-800">All</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        Inclusion
                        <ChevronDown className="w-4 h-4" />
                        <span className="font-medium text-gray-800">All</span>
                    </div>
                </div>

                {/* Tableau */}
                <div className="border rounded-md">
                    <div className="grid grid-cols-3 text-sm font-medium text-gray-500 border-b px-4 py-2">
                        <div>Type</div>
                        <div>Name</div>
                        <div>Inclusion</div>
                    </div>
                    {recipients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-gray-500 text-sm p-8">
                            <p className="mb-4 text-center">Start building recipients list</p>
                            <p className="mb-6 text-center text-xs text-gray-400">
                                Include or exclude contacts, lists and filters.
                            </p>
                            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>Add recipients</Button>
                        </div>
                    ) : (
                        recipients.map((r) => (
                            <div
                                key={r.id}
                                className="grid grid-cols-3 text-sm text-gray-700 border-t px-4 py-2"
                            >
                                <div>{r.type}</div>
                                <div>{r.name}</div>
                                <div
                                    className={`font-medium ${
                                        r.inclusion === 'Include' ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {r.inclusion}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Colonne droite */}
            <div className="w-[320px] p-8">
                <h2 className="text-lg font-bold mb-4">Prepare a better mailing list</h2>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between border rounded-md p-4">
                        <div className={`flex items-center gap-2 font-medium ${errorCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            <AlertCircle className="w-4 h-4" />
                            {errorCount} error
                        </div>
                        {errorCount > 0 && <span className="text-gray-500">No recipients selected</span>}
                    </div>
                    <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center gap-2 text-yellow-500 font-medium">
                            <Lightbulb className="w-4 h-4" />
                            {suggestionCount} suggestions
                        </div>
                    </div>
                    <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            {doneCount} done
                        </div>
                    </div>
                </div>
            </div>

            {/* Popin Add recipients */}
            <AddRecipientsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onAddRecipients={handleAddRecipients}
                descriptionId="description-recipients"
            />
        </div>
    );
}