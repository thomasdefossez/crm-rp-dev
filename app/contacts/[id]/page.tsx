'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Star, ArrowLeft, List, Zap, Book, ChevronLeft, ChevronRight, User, Building } from 'lucide-react';
import { toast } from 'sonner'; // Ajout du toast
import CentralColumn from './_components/CentralColumn';

import { Input } from '@/components/ui/input';

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const contactId = params?.id;

    const [contact, setContact] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 50; // Remplacez ceci par le nombre total d'éléments dans votre base de données ou l'API.
    const [email, setEmail] = useState(''); // Email initial du contact
    const [phone, setPhone] = useState(''); // Téléphone initial du contact
    const [address, setAddress] = useState(''); // Adresse initiale du contact
    const [isEditable, setIsEditable] = useState(false); // Contrôle de l'édition de l'email et téléphone
    const [isAddressEditable, setIsAddressEditable] = useState(false); // Contrôle de l'édition de l'adresse

    useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('contacts').select('*').eq('id', contactId).single();
            setContact(data);
            setEmail(data?.email || '');
            setPhone(data?.phone || '');
            setAddress(data?.address || '');
        };
        fetchContact();
    }, [contactId]);

    // Fonction pour sauvegarder les modifications des champs email, téléphone, adresse
    const handleSaveChanges = async () => {
        try {
            // Met à jour l'email, téléphone et adresse dans la base de données
            const { error } = await supabase.from('contacts').update({ email, phone, address }).eq('id', contactId);
            if (error) throw new Error(error.message);
            toast.success("Informations mises à jour avec succès !");
            setContact((prev: any) => prev ? { ...prev, email, phone, address } : prev);
            setIsEditable(false);
        } catch (error: any) {
            toast.error(`Erreur lors de la mise à jour : ${error.message}`);
        }
    };

    const handleAddressSave = async () => {
        try {
            // Met à jour l'adresse dans la base de données si elle est modifiée
            const { error } = await supabase.from('contacts').update({ address }).eq('id', contactId);
            if (error) throw new Error(error.message);
            toast.success("Adresse mise à jour avec succès !");
            setContact((prev: any) => prev ? { ...prev, address } : prev);
            setIsAddressEditable(false);
        } catch (error: any) {
            toast.error(`Erreur lors de la mise à jour de l'adresse : ${error.message}`);
        }
    };

    const deleteContact = async () => {
        try {
            // Suppression du contact dans Supabase
            const { error } = await supabase.from('contacts').delete().eq('id', contactId);
            if (error) {
                throw new Error(error.message);
            }
            toast.success('Contact supprimé avec succès');
            router.push('/contacts'); // Rediriger vers la liste des contacts
        } catch (error: any) {
            toast.error(`Erreur lors de la suppression : ${error.message}`);
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-8 py-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/contacts')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Star className="h-5 w-5" />
                    </Button>
                </div>
                <Button variant="outline" className="text-sm text-red-600" onClick={deleteContact}>
                    Supprimer ce contact
                </Button>
            </div>

            {/* Grille trois colonnes */}
            <div className="flex-1 grid grid-cols-4 gap-6 p-8">
                {/* Colonne gauche */}
                <div className="space-y-6 col-span-1">
                    <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
                        {contact?.company_name ? (
                            <Building className="h-6 w-6 text-gray-500" />
                        ) : (
                            <User className="h-6 w-6 text-gray-500" />
                        )}
                        {contact?.company_name
                            ? contact.company_name
                            : `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()}
                    </div>

                    <div className="border rounded-lg p-4">
                        <h2 className="text-sm font-medium text-gray-700 mb-2">Informations</h2>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500">
                                <strong>Nom du contact : </strong>
                                {contact?.company_name
                                    ? contact.company_name
                                    : `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Propriétaire : </strong> {contact?.owner}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Site Web : </strong> {contact?.website || 'Non renseigné'}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Revenus : </strong> {contact?.revenue || 'Non renseigné'}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Créé à : </strong> {contact?.created_at}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Email : </strong>
                                {/* Champ email modifiable inline */}
                                <div className="flex items-center gap-2">
                                    {isEditable ? (
                                        <>
                                            <Input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-60"
                                                autoFocus
                                                onBlur={handleSaveChanges}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveChanges();
                                                    }
                                                }}
                                            />
                                            <Button onClick={handleSaveChanges} className="bg-violet-600 text-white">Sauvegarder</Button>
                                        </>
                                    ) : (
                                        <span
                                            className="text-gray-600 cursor-pointer"
                                            onClick={() => setIsEditable(true)}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') setIsEditable(true);
                                            }}
                                            role="button"
                                            aria-label="Modifier l'email"
                                        >
                                            {email || 'Non renseigné'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Téléphone : </strong>
                                {isEditable ? (
                                    <Input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-60"
                                    />
                                ) : (
                                    <span
                                        className="text-gray-600 cursor-pointer"
                                        onClick={() => setIsEditable(true)}
                                    >
                                        {phone || 'Non renseigné'}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Adresse : </strong>
                                {isAddressEditable ? (
                                    <Input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-60"
                                    />
                                ) : (
                                    <span
                                        className="text-gray-600 cursor-pointer"
                                        onClick={() => setIsAddressEditable(true)}
                                    >
                                        {address || 'Non renseignée'}
                                    </span>
                                )}
                                {isAddressEditable && (
                                    <Button onClick={handleAddressSave} className="bg-violet-600 text-white">
                                        Sauvegarder l'adresse
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h2 className="text-sm font-medium text-gray-700 mb-2">Historique récent</h2>
                        <p className="text-sm text-gray-500">March 2023</p>
                        <p className="text-sm text-gray-500">Entreprise créée le 26 mars 2023 à 10:00 PM</p>
                        <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                            Afficher l&apos;historique complet
                        </Button>
                    </div>
                </div>

                {/* Colonne centrale */}
                <div className="col-span-2">
                    <CentralColumn />
                </div>

                {/* Colonne droite */}
                <div className="space-y-6 col-span-1">
                    {/* Pagination */}
                    <div className="flex items-center justify-between border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between w-full">
                            <Button
                                variant="ghost"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-5 w-5 text-violet-600" />
                            </Button>
                            <div className="text-sm text-gray-700">
                                {currentPage} de {totalPages}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-5 w-5 text-violet-600" />
                            </Button>
                        </div>
                    </div>
                    {/* Bloc Opportunités */}
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                            <Zap className="h-4 w-4 text-violet-600" />
                            Opportunités
                        </div>
                        <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                            Voir les opportunités
                        </Button>
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                            <Zap className="h-4 w-4 text-violet-600" />
                            Filtres enregistrés
                        </div>
                        <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                            Tous les contacts
                        </Button>
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                            <List className="h-4 w-4 text-violet-600" />
                            Listes
                        </div>
                        <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                            Ajouter à des listes
                        </Button>
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
                            <Book className="h-4 w-4 text-violet-600" />
                            Sujets couverts
                        </div>
                        <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                            Ajouter des sujets
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}