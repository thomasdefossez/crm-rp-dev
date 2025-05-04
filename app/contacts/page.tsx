'use client';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React, { useEffect, useState, useRef } from 'react';
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Settings, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ContactsTable } from './_components/contacts-table';
import { CreateContactDrawer } from './_components/CreateContactDrawer';
import { AddToListDialog } from './_components/AddToListDialog';
import ContactsUpdatesPanel from './_components/ContactsUpdatesPanel';
import { MediaListsTable } from './_components/MediaListsTable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContactsPage() {
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const dialogTriggerRef = useRef<HTMLButtonElement>(null);
    const [showAddToListDialog, setShowAddToListDialog] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState('contacts');

    // Nouveaux états pour les listes
    const [selectedLists, setSelectedLists] = useState<number[]>([]);
    const [totalRecipients, setTotalRecipients] = useState(0);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const [exportFormat, setExportFormat] = useState('CSV');

    const [drawerOpen, setDrawerOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchCount = async () => {
            const { count, error } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true });
            if (!error && count !== null) {
                setTotalContacts(count);
            }
        };
        fetchCount();
    }, [refreshCounter]);

    const handleCreateList = async (listName: string) => {
        const { error } = await supabase
            .from('lists')
            .insert([{ name: listName }]);
        if (error) {
            toast.error('Erreur lors de la création de la liste');
        } else {
            toast.success('Liste créée avec succès !');
            setRefreshCounter((c) => c + 1);
            dialogTriggerRef.current?.click();
        }
    };

    const handleOpenAddToList = () => {
        if (selectedContacts.length === 0) {
            toast.error('Vous devez sélectionner un ou des contacts');
            return;
        }
        setShowAddToListDialog(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex flex-col flex-1 pt-6">
                {/* Breadcrumb */}
                <div className="px-8 pt-6 pb-2 text-sm text-gray-500">
                    <span className="text-gray-700">Accueil</span> <span className="mx-1">&rarr;</span> <span className="font-medium text-gray-400">Contacts</span>
                </div>

                {/* Header */}
                <div className="px-8 pb-4 flex flex-col gap-2">
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contacts</h1>
                        <span className="text-sm text-purple-600">({totalContacts})</span>
                    </div>
                </div>

                {/* Tabs and Actions */}
                <div className="flex items-end justify-between px-8 border-b">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-transparent p-0 border-none">
                            <TabsTrigger value="contacts">Contacts</TabsTrigger>
                            <TabsTrigger value="updates">Mises à jour des contacts</TabsTrigger>
                            <TabsTrigger value="media">Listes</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex gap-2 pb-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="mr-2 h-4 w-4" />
                              Paramètres
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Exporter les contacts')}>
                              Exporter les contacts
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <button onClick={() => router.push('/settings/import')} className="w-full text-left">
                                Paramètres d’import
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Synchronisation')}>
                              Synchronisation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button ref={dialogTriggerRef} variant="outline" size="sm">Nouvelle liste</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md p-6 rounded-lg shadow-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-gray-900">Créer une nouvelle liste</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom de la liste <span className="text-gray-500">(Obligatoire)</span></label>
                                        <Input id="list-name" placeholder="Nom de la liste" className="mt-1" />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" className="border-gray-300 text-gray-700">Annuler</Button>
                                        <Button className="bg-purple-600 text-white hover:bg-purple-700"
                                                onClick={async () => {
                                                    const input = document.querySelector<HTMLInputElement>('#list-name');
                                                    if (!input || !input.value.trim()) return;
                                                    const listName = input.value.trim();
                                                    await handleCreateList(listName);
                                                    input.value = '';
                                                }}>
                                            Enregistrer
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <TooltipProvider>
                          <Dialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2"
                                      disabled={selectedContacts.length === 0}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                      Export
                                    </Button>
                                  </DialogTrigger>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {selectedContacts.length === 0
                                  ? "Sélectionnez des contacts pour activer l'export"
                                  : "Exporter les contacts sélectionnés"}
                              </TooltipContent>
                            </Tooltip>
                            <DialogContent className="max-w-sm p-6 rounded-lg shadow-xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-semibold text-gray-900">Exporter les contacts</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Sélectionner le format</label>
                                  <Select value={exportFormat} onValueChange={setExportFormat}>
                                    <SelectTrigger className="w-full mt-1">
                                      <SelectValue placeholder="Choisir un format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CSV">CSV</SelectItem>
                                      <SelectItem value="XLS">XLS</SelectItem>
                                      <SelectItem value="XLSX">XLSX</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 pt-2">
                                  <a href="#" className="text-blue-600 hover:underline">Comment sont comptées les limites d’export ?</a>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline" className="border-gray-300 text-gray-700">Annuler</Button>
                                  <Button
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => handleExport(exportFormat)}
                                  >
                                    Suivant
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TooltipProvider>
                        <Dialog open={showAddToListDialog} onOpenChange={setShowAddToListDialog}>
                            <DialogContent className="max-w-md">
                                <AddToListDialog
                                    onClose={() => setShowAddToListDialog(false)}
                                    selectedContacts={selectedContacts}
                                />
                            </DialogContent>
                        </Dialog>

                        <CreateContactDrawer
                            open={drawerOpen}
                            onOpenChange={setDrawerOpen}
                            triggerButton={
                                <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                                    Ajouter un contact
                                </Button>
                            }
                            onContactCreated={() => setRefreshCounter(c => c + 1)}
                        />
                        <Button
                            size="sm"
                            className="bg-purple-600 text-white hover:bg-purple-700"
                            disabled={selectedLists.length === 0}
                            onClick={() => setShowEmailModal(true)}
                        >
                            Envoyer un email
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1">
                    <aside className="w-64 border-r bg-gray-50 p-6">
                        <div className="text-sm font-medium text-gray-700 mb-4">Filtres enregistrés</div>
                        <Input placeholder="Tapez pour rechercher..." className="mb-4" />
                        <div className="text-sm text-gray-700 mb-6">Tous les contacts</div>
                        <div className="space-y-6">
                            {['Informations de contact', 'Localisation', 'Engagement email', 'Créé par', 'Créé le', 'Profils réseaux sociaux'].map((section) => (
                                <div key={section}>
                                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                                        <span>{section}</span>
                                        <span className="text-lg font-bold text-primary">+</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 p-8">
                        {activeTab === 'contacts' && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleOpenAddToList}>Ajouter aux listes</Button>
                                        <Button variant="ghost" size="sm">Ajouter des tags</Button>
                                        <Button variant="ghost" size="sm"><MoreHorizontal className="mr-2 h-4 w-4" /> Plus d’actions</Button>
                                    </div>
                                    <Input
                                        placeholder="Rechercher des contacts"
                                        className="w-[300px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <ContactsTable
                                    refreshTrigger={refreshCounter}
                                    onTotalContactsChange={(total) => setTotalContacts(total)}
                                    searchQuery={searchQuery}
                                    onSelectionChange={(ids) => setSelectedContacts(ids.map(Number))}
                                />
                                <div className="flex justify-center items-center mt-6 space-x-4">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Précédent</Button>
                                    <span className="text-sm text-gray-600">Page {currentPage}</span>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev + 1)}>Suivant</Button>
                                </div>
                            </>
                        )}
                        {activeTab === 'updates' && (
                          <>
                            <div className="mb-4 text-gray-700 text-sm">
                              Affichage des contacts modifiés au cours des 7 derniers jours.
                            </div>
                            <ContactsTable
                              refreshTrigger={refreshCounter}
                              onTotalContactsChange={(total) => setTotalContacts(total)}
                              searchQuery={searchQuery}
                              onSelectionChange={(ids) => setSelectedContacts(ids.map(Number))}
                              filterUpdatedSince={7}
                            />
                          </>
                        )}
                        {activeTab === 'media' && (
                            <MediaListsTable
                                onSelectionChange={setSelectedLists}
                                onRecipientsChange={setTotalRecipients}
                            />
                        )}
                    </main>
                </div>
            </div>

            {/* Modal Email */}
            <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Envoyer un communiqué</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>
                            Vous êtes sur le point d’envoyer un communiqué à <strong>{totalRecipients}</strong> contact(s).
                        </p>
                        <Button
                            className="bg-purple-600 text-white hover:bg-purple-700 w-full"
                            onClick={() => router.push('/emails')}
                        >
                            Je suis prêt à envoyer mon communiqué
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
    function handleExport(format: string) {
        if (selectedContacts.length === 0) return;

        const wsData = selectedContacts.map((id) => {
            const contact = document.querySelector(`[data-contact-id="${id}"]`);
            return {
                Nom: contact?.getAttribute('data-contact-nom') || '',
                Prénom: contact?.getAttribute('data-contact-prenom') || '',
                Email: contact?.getAttribute('data-contact-email') || '',
            };
        });

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

        const fileType = format.toLowerCase();
        const fileExtension = fileType === 'csv' ? '.csv' : `.${fileType}`;
        const fileName = `contacts_export_${new Date().toISOString()}`;

        const wbout = fileType === 'csv'
            ? XLSX.utils.sheet_to_csv(ws)
            : XLSX.write(wb, { bookType: fileType as XLSX.BookType, type: 'binary' });

        const blob = new Blob(
            [fileType === 'csv' ? wbout : s2ab(wbout)],
            { type: 'application/octet-stream' }
        );

        saveAs(blob, `${fileName}${fileExtension}`);
    }

    function s2ab(s: string) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i);
        return buf;
    }
}