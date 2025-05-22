'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabaseClient';
import { Settings, Star, ArrowLeft, Zap, FileText, Mail, PlusCircle, Trash2, Factory, BookUser, LayoutDashboard, Bell } from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Ajout du toast

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Import CreateContactDrawer if not already imported
import { CreateContactDrawer } from "@/app/contacts/_components/CreateContactDrawer";


import { Input } from '@/components/ui/input';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

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
    // Contrôle de l'édition du bloc "Informations contact"
    const [isContactEditable, setIsContactEditable] = useState(false);
    // Hooks d'état pour informations société
    const [isCompanyEditable, setIsCompanyEditable] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [revenue, setRevenue] = useState('');
    // Spinner pour enrichissement Pappers
    const [isEnriching, setIsEnriching] = useState(false);
    // Pour afficher l'icône verte après enrichissement réussi
    const [isEnriched, setIsEnriched] = useState(false);
    // Nouveaux hooks d'état pour infos complémentaires (Pappers)
    const [siren, setSiren] = useState('');
    const [siretSiegeSocial, setSiretSiegeSocial] = useState('');
    const [formeJuridique, setFormeJuridique] = useState('');
    const [codeNaf, setCodeNaf] = useState('');
    const [libelleCodeNaf, setLibelleCodeNaf] = useState('');
    const [dateCreation, setDateCreation] = useState('');
    // Onglets activité
    const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'interactions' | 'reminders' | 'files'>('all');
    // Onglets principaux (Aperçu / Activité)
    const [mainTab, setMainTab] = useState<'overview' | 'activity'>('activity');

    // State for CreateContactDrawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('contacts').select('*').eq('id', contactId).single();
            setContact(data);
            setEmail(data?.email || '');
            setPhone(data?.phone || '');
            setAddress(data?.address || '');
            setCompanyName(data?.company_name || '');
            setWebsite(data?.website || '');
            setRevenue(data?.revenue || '');
            setSiren(data?.siren || '');
            setSiretSiegeSocial(data?.siret_siege_social || '');
            setFormeJuridique(data?.forme_juridique || '');
            setCodeNaf(data?.code_naf || '');
            setLibelleCodeNaf(data?.libelle_code_naf || '');
            setDateCreation(data?.date_creation || '');
        };
        fetchContact();
    }, [contactId]);

    // Fonction pour sauvegarder les modifications des champs email, téléphone, adresse, firstname, lastname, gender
    const handleSaveChanges = async () => {
        try {
            const { error } = await supabase.from('contacts').update({
                email,
                phone,
                address,
                firstname: contact?.firstname,
                lastname: contact?.lastname,
                gender: contact?.gender,
            }).eq('id', contactId);
            if (error) throw new Error(error.message);
            toast.success("Informations mises à jour avec succès !");
            setContact((prev: any) =>
                prev ? {
                    ...prev,
                    email,
                    phone,
                    address,
                    firstname: contact?.firstname,
                    lastname: contact?.lastname,
                    gender: contact?.gender,
                } : prev
            );
            setIsEditable(false);
            setIsContactEditable(false);
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

    // Fonction pour sauvegarder les informations société
    const handleCompanySave = async () => {
        try {
            const { error } = await supabase.from('contacts').update({
                company_name: companyName,
                website,
                revenue,
                email,
                phone,
                address,
                siren: contact?.siren,
                siret_siege_social: contact?.siret_siege_social,
                forme_juridique: contact?.forme_juridique,
                code_naf: contact?.code_naf,
                libelle_code_naf: contact?.libelle_code_naf,
                date_creation: contact?.date_creation,
            }).eq('id', contactId);

            if (error) throw new Error(error.message);

            toast.success("Informations société mises à jour !");
            setIsCompanyEditable(false);
            setContact((prev: any) =>
                prev ? {
                    ...prev,
                    company_name: companyName,
                    website,
                    revenue,
                    email,
                    phone,
                    address,
                    siren: contact?.siren,
                    siret_siege_social: contact?.siret_siege_social,
                    forme_juridique: contact?.forme_juridique,
                    code_naf: contact?.code_naf,
                    libelle_code_naf: contact?.libelle_code_naf,
                    date_creation: contact?.date_creation,
                } : prev
            );
        } catch (error: any) {
            toast.error(`Erreur : ${error.message}`);
        }
    };

    // Fonction d'enrichissement via l'API Pappers (appel réel)
    const enrichWithPappers = async () => {
        setIsEnriching(true);
        try {
            const response = await fetch(
                `https://api.pappers.fr/v2/recherche?api_token=055e4e2e8825bb256b5f1d83cabde91de31c3b96ba42c744&q=${encodeURIComponent(companyName)}`
            );
            const data = await response.json();

            if (data.resultats && data.resultats.length > 0) {
                const result = data.resultats[0];

                setCompanyName(result.nom_entreprise || companyName);
                setAddress(result.siege?.adresse_ligne || address);
                setRevenue(result.dernier_ca?.toString() || revenue);
                setSiren(result.siren || '');
                setSiretSiegeSocial(result.siege?.siret || '');
                setFormeJuridique(result.forme_juridique || '');
                setCodeNaf(result.code_naf || '');
                setLibelleCodeNaf(result.libelle_code_naf || '');
                setDateCreation(result.date_creation || '');

                setContact((prev: any) =>
                    prev
                        ? {
                            ...prev,
                            siren: result.siren,
                            siret_siege_social: result.siege?.siret,
                            forme_juridique: result.forme_juridique,
                            code_naf: result.code_naf,
                            libelle_code_naf: result.libelle_code_naf,
                            date_creation: result.date_creation,
                        }
                        : prev
                );

                toast.success("Enrichissement réussi !");
                await handleCompanySave();
                setIsEnriched(true);
            } else {
                toast.error("Aucun résultat trouvé sur Pappers.");
            }
        } catch (error: any) {
            toast.error(`Erreur enrichissement : ${error.message}`);
        } finally {
            setIsEnriching(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Détail</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="p-4">
                    {/* contenu original de ta page ici (Header + Grille 3 colonnes) */}
                    <div className="flex items-center justify-between border-b px-8 py-4">
                        <div className="flex items-center gap-4">
                          {contact?.website && (
                            <img
                              src={`https://logo.clearbit.com/${contact.website}`}
                              alt="logo"
                              className="h-8 w-8 rounded-sm border border-gray-200 object-contain"
                            />
                          )}
                          <div className="text-lg font-medium text-sidebar-foreground">
                            {contact?.company_name
                              ? contact.company_name
                              : `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs text-muted-foreground">No Connection</Badge>
                            <Badge variant="outline" className="text-xs text-muted-foreground">No Interaction</Badge>
                          </div>
                        </div>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full px-3 py-1">
                                  <Mail className="h-4 w-4" />
                                  Compose email
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Écrire un email</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full p-2">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ajouter une note</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full p-2">
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Créer une tâche</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full p-2">
                                  <Zap className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Déclencher une action</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full p-2 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={deleteContact}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                    </div>

                   
                    <div className="grid grid-cols-4 gap-6 p-8 items-start">
                        <aside className="xl:col-span-1 space-y-6 col-span-1">
                          
                          
                        </aside>
                        <aside className="xl:col-span-1 space-y-6 col-span-1">
                          {/* À compléter */}
                        </aside>
                    </div>
                </div>
                {/* CreateContactDrawer component */}
                <CreateContactDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}