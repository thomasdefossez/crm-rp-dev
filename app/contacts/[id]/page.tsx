'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabaseClient';
import { Settings, Star, ArrowLeft, Zap, FileText, Mail, PlusCircle, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Ajout du toast


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
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600" />
                  Créer un devis
                </Button>
                <Button variant="secondary" className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-600" />
                  Créer un email
                </Button>
                <Button variant="secondary" className="text-sm flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-violet-600" />
                  Créer une action
                </Button>
                <Button variant="outline" className="text-sm text-red-600 flex items-center gap-2" onClick={deleteContact}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                  Supprimer ce contact
                </Button>
              </div>
            </div>

            {/* Grille trois colonnes */}
            <div className="grid grid-cols-4 gap-6 p-8 items-start">
              <aside className="xl:col-span-1 space-y-6 col-span-1">
                {/* colonne gauche */}
                <div className="text-lg font-medium text-sidebar-foreground flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M17 18h1" />
                    <path d="M12 18h1" />
                    <path d="M7 18h1" />
                  </svg>
                  {contact?.company_name
                    ? contact.company_name
                    : `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()}
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Informations société</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={isCompanyEditable ? handleCompanySave : () => setIsCompanyEditable(true)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        +
                      </Button>
                      {isEnriching ? (
                        <Button
                          type="button"
                          disabled
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 text-gray-500 flex items-center gap-2"
                        >
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Enrichissement…
                        </Button>
                      ) : (
                        <Button
                          onClick={enrichWithPappers}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          title="Enrichir via Pappers"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={cn("h-5 w-5", isEnriched && "text-green-600")}
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-sidebar-foreground">
                    <div className="py-2 flex justify-between">
                        <span className="text-xs text-muted-foreground">Nom société</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 100) || '';
                            setCompanyName(value);
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : companyName !== contact?.company_name
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {(companyName || isCompanyEditable) && <>{companyName || '—'}</>}
                        </span>
                        {!isCompanyEditable && companyName !== contact?.company_name && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Site Web</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 100) || '';
                            let isValid = false;
                            try {
                              const url = new URL(value.startsWith('http') ? value : 'https://' + value);
                              isValid = !!url.hostname;
                            } catch {
                              isValid = false;
                            }
                            if (!isValid) {
                              toast.error("URL du site invalide");
                            } else {
                              setWebsite(value);
                            }
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : website !== contact?.website
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {(website || isCompanyEditable) && <>{website || '—'}</>}
                        </span>
                        {!isCompanyEditable && website !== contact?.website && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Revenus</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 50) || '';
                            setRevenue(value);
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : revenue !== contact?.revenue
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {(revenue || isCompanyEditable) && <>{revenue || '—'}</>}
                        </span>
                        {!isCompanyEditable && revenue !== contact?.revenue && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Créé le</span>
                      <span className="text-gray-500">
                        {contact?.created_at
                          ? new Date(contact.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 100) || '';
                            const isValid = value.includes('@');
                            if (!isValid) {
                              toast.error("Email invalide");
                            } else {
                              setEmail(value);
                            }
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : email !== contact?.email
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {email && <>{email}</>}
                        </span>
                        {!isCompanyEditable && email !== contact?.email && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Téléphone</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 30) || '';
                            setPhone(value);
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : phone !== contact?.phone
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {phone && <>{phone}</>}
                        </span>
                        {!isCompanyEditable && phone !== contact?.phone && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-xs text-muted-foreground">Adresse</span>
                      <div className="flex items-center gap-1">
                        <span
                          contentEditable={isCompanyEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const value = e.currentTarget.textContent?.trim().slice(0, 150) || '';
                            setAddress(value);
                          }}
                          className={cn(
                            "text-xs",
                            isCompanyEditable
                              ? "text-gray-700 focus:outline-none border-b border-green-500"
                              : address !== contact?.address
                                ? "text-violet-600 font-medium"
                                : "text-gray-500"
                          )}
                        >
                          {address && <>{address}</>}
                        </span>
                        {!isCompanyEditable && address !== contact?.address && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* Informations complémentaires (Pappers) */}
                    <div className="pt-4">
                      <details className="text-sm text-xs text-muted-foreground">
                        <summary className="text-sidebar-foreground mb-2">
                          Informations complémentaires
                        </summary>
                        <div className="space-y-2 mt-2 border-t pt-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">SIREN</span>
                            <span className="text-gray-500 text-xs">{siren || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">SIRET siège</span>
                            <span className="text-gray-500 text-xs">{siretSiegeSocial || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Forme juridique</span>
                            <span
                              contentEditable={isCompanyEditable}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const value = e.currentTarget.textContent?.trim() || '';
                                setFormeJuridique(value.slice(0, 30));
                              }}
                              className={cn(
                                "text-xs",
                                isCompanyEditable
                                  ? "text-gray-700 focus:outline-none border-b border-green-500"
                                  : "text-gray-500"
                              )}
                            >
                              {(formeJuridique || isCompanyEditable) && <>{formeJuridique || '—'}</>}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Code NAF</span>
                            <span className="text-gray-500 text-xs">{codeNaf || '—'} - {libelleCodeNaf || ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Date de création</span>
                            <span className="text-gray-500 text-xs">
                              {dateCreation
                                ? new Date(dateCreation).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </details>
                    </div>
                  </CardContent>
                </Card>
                {/* Bloc informations de contact */}
                <Card>
                  <CardHeader className="flex items-center justify-between pb-2">
                    <CardTitle className="text-base">Informations contact</CardTitle>
                    <Button
                      onClick={isContactEditable ? handleSaveChanges : () => setIsContactEditable(true)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      +
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-sidebar-foreground">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Nom du contact</span>
                      <span
                        contentEditable={isContactEditable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const parts = e.currentTarget.textContent?.trim().split(' ') || [];
                          setContact((prev: any) =>
                            prev ? { ...prev, firstname: parts[0] || '', lastname: parts.slice(1).join(' ') || '' } : prev
                          );
                        }}
                        className={cn(
                          "text-xs",
                          isContactEditable
                            ? "text-gray-700 focus:outline-none border-b border-green-500"
                            : "text-gray-800"
                        )}
                      >
                        {`${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Genre</span>
                      <span
                        contentEditable={isContactEditable}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const value = e.currentTarget.textContent?.trim() || '';
                          setContact((prev: any) =>
                            prev ? { ...prev, gender: value } : prev
                          );
                        }}
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          isContactEditable
                            ? "text-gray-700 border-b border-green-500"
                            : contact?.gender
                            ? "bg-[#EAE6FD] text-[#6B4EFF]"
                            : "text-gray-500"
                        )}
                      >
                        {contact?.gender || '—'}
                      </span>
                    </div>
                    {(!companyName || companyName !== contact?.company_name) && (
                      <>
                        {(!contact?.email || contact?.email !== email) && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Email</span>
                            <span className="text-xs text-gray-800">{email || '—'}</span>
                          </div>
                        )}
                        {(!contact?.phone || contact?.phone !== phone) && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Téléphone</span>
                            <span className="text-xs text-gray-800">{phone || '—'}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Notifications</span>
                      <span className="text-xs text-gray-800">{contact?.notifications || '—'}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="border rounded-lg p-4 space-y-4 bg-white">
                  <h2 className="text-sidebar-foreground mb-2">Historique récent</h2>
                  <p className="text-xs text-gray-800">Mars 2023</p>
                  <p className="text-xs text-gray-800">Entreprise créée le 26 mars 2023 à 22:00</p>
                  <Button variant="link" className="text-violet-600 p-0 h-auto text-sm">
                    Voir tout l&apos;historique
                  </Button>
                </div>
              </aside>

              <section className="xl:col-span-2 space-y-6 col-span-2">
                <div className="space-y-6">
                  {/* Onglets aperçu / activité */}
                  <div className="flex items-center gap-6 text-sm font-medium text-sidebar-foreground pb-2">
                    <button
                      onClick={() => setMainTab('overview')}
                      className={cn(
                        "pb-1",
                        mainTab === 'overview'
                          ? "text-sidebar-foreground font-semibold border-b-2 border-sidebar-foreground"
                          : "hover:text-sidebar-foreground"
                      )}
                    >
                      Aperçu
                    </button>
                    <button
                      onClick={() => setMainTab('activity')}
                      className={cn(
                        "pb-1 flex items-center gap-1",
                        mainTab === 'activity'
                          ? "text-sidebar-foreground font-semibold border-b-2 border-sidebar-foreground"
                          : "hover:text-sidebar-foreground"
                      )}
                    >
                      Activité
                    </button>
                  </div>
                  {/* Contenu principal selon l'onglet sélectionné */}
                  {mainTab === 'activity' && (
                    <>
                      <div className="flex items-center gap-6 text-sm font-medium text-sidebar-foreground pb-2">
                        {[
                          { label: 'Tous', value: 'all', count: 136 },
                          { label: 'Notes', value: 'notes', count: 19 },
                          { label: 'Interactions', value: 'interactions', count: 24 },
                          { label: 'Rappels', value: 'reminders', count: 7 },
                          { label: 'Fichiers', value: 'files', count: 70 },
                        ].map(({ label, value, count }) => (
                          <button
                            key={value}
                            onClick={() => setActiveTab(value as typeof activeTab)}
                            className={cn(
                              "pb-1",
                              activeTab === value
                                ? "text-violet-600 border-b-2 border-violet-600"
                                : "hover:text-sidebar-foreground"
                            )}
                          >
                            {label} ({count})
                          </button>
                        ))}
                      </div>

                      <h2 className="text-base font-semibold text-sidebar-foreground">Historique</h2>
                      <div className="space-y-4">
                        {activeTab === 'all' && (
                          <>
                            {/* Élément d'événement */}
                            <div className="relative pl-6">
                              <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" />
                              <div className="rounded-lg bg-white border border-gray-200 p-4 shadow-sm text-sm">
                                <p>
                                  <span className="font-medium text-sidebar-foreground">Cameron McLawrence</span> a démarré une conversation sur 
                                  <span className="ml-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">WhatsApp</span>
                                </p>
                                <p className="mt-1 text-gray-500">Opérateur : Andrew Vance</p>
                                <p className="mt-1 text-right text-xs text-gray-400">Actif il y a 12 min</p>
                              </div>
                            </div>
                            {/* Fichier téléchargé */}
                            <div className="relative pl-6">
                              <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" />
                              <div className="rounded-lg bg-white border border-gray-200 p-4 shadow-sm text-sm">
                                <p>Fichier téléchargé <a href="#" className="text-blue-600 underline">my-cool-file.jpg</a></p>
                                <p className="mt-1 text-gray-500">Ajouté par : Lora Adams</p>
                                <p className="mt-1 text-right text-xs text-gray-400">Il y a 2 heures</p>
                              </div>
                            </div>
                            {/* Événement déclenché */}
                            <div className="relative pl-6">
                              <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-500" />
                              <div className="rounded-lg bg-white border border-gray-200 p-4 shadow-sm text-sm">
                                <p>Événement déclenché <span className="text-orange-600">webinar-email-follow-up</span></p>
                                <p className="text-xs text-gray-800">source : Christmas Promotion Website</p>
                                <p className="mt-1 text-gray-500">Déclenché par : John Lock</p>
                                <p className="mt-1 text-right text-xs text-gray-400">14 déc. 2023 à 15:31</p>
                              </div>
                            </div>
                          </>
                        )}
                        {activeTab === 'notes' && <div className="text-sm text-gray-600">Contenu des notes</div>}
                        {activeTab === 'interactions' && <div className="text-sm text-gray-600">Contenu des interactions</div>}
                        {activeTab === 'reminders' && <div className="text-sm text-gray-600">Contenu des rappels</div>}
                        {activeTab === 'files' && <div className="text-sm text-gray-600">Contenu des fichiers</div>}
                      </div>
                    </>
                  )}
                  {mainTab === 'overview' && (
                    <div className="text-sm text-gray-600">Contenu de l’onglet Aperçu</div>
                  )}
                </div>
              </section>

              <aside className="xl:col-span-1 space-y-6 col-span-1">
                {/* Trello */}
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center text-sm font-medium text-sidebar-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-600" />
                      Trello
                    </div>
                    <a href="#" className="text-xs text-gray-800 hover:underline">Voir dans Trello</a>
                  </div>
                  <div className="text-sm text-sidebar-foreground">
                    <p className="font-medium mb-1">Sources</p>
                    <p className="text-sm text-gray-500">
                      <span className="mr-2 inline-flex items-center gap-1">
                        <span className="bg-gray-200 rounded px-1.5 py-0.5 text-xs">2023 Strategy</span>
                      </span>
                      <span className="text-xs">sur <span className="font-medium text-sidebar-foreground">Marketing</span></span>
                    </p>
                  </div>
                </div>

                {/* Rappel */}
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center text-sm font-medium text-sidebar-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-600" />
                      Rappel
                    </div>
                    <a href="#" className="text-xs text-gray-800 hover:underline">Voir tout</a>
                  </div>
                  <div className="text-sm text-sidebar-foreground space-y-2">
                    <div>
                      <p className="font-medium text-sidebar-foreground">Rappel de <span className="text-gray-500">Mike Drucker</span></p>
                      <p className="text-xs text-gray-800">Déclenché dans deux heures</p>
                    </div>
                    <div>
                      <p className="font-medium text-sidebar-foreground">Rappel de <span className="text-gray-500">Samantha Smith</span></p>
                      <p className="text-xs text-gray-800">Déclenché lundi prochain</p>
                    </div>
                  </div>
                </div>

                {/* Évaluations */}
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center text-sm font-medium text-sidebar-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-600" />
                      Évaluations
                    </div>
                    <a href="#" className="text-xs text-gray-800 hover:underline">Voir tout</a>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400">★★★★☆</div>
                        <span className="text-sidebar-foreground">Adam Pierson</span>
                      </div>
                      <Button variant="ghost" size="icon" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600">⋯</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400">★★★☆☆</div>
                        <span className="text-sidebar-foreground">Evelina O’Brian</span>
                      </div>
                      <Button variant="ghost" size="icon" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600">⋯</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400">★☆☆☆☆</div>
                        <span className="text-sidebar-foreground">Luke White</span>
                      </div>
                      <Button variant="ghost" size="icon" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600">⋯</Button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
}