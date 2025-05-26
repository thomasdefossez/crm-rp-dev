// Début du fichier : 'use client' puis imports
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Zap, FileText, Mail, PlusCircle, Trash2, BookUser, LayoutDashboard, CheckSquare, Folder, Phone, Users, Globe, MessageSquare, Briefcase, ImageIcon, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
// Helper to format file size
function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Ajout du toast

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Import CreateContactDrawer if not already imported
import { CreateContactDrawer } from "@/app/contacts/_components/CreateContactDrawer";


import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SendTestEmailDialog } from "@/app/emails/SendTestEmailDialog";
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
    const [isCompanyEditable, setIsCompanyEditable] = useState(false); // conservé pour compatibilité, mais plus utilisé ci-dessous
    // États d'édition indépendants pour Nom société et Tags
    const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [revenue, setRevenue] = useState('');
    // Spinner pour enrichissement Pappers
    const [isEnriching, setIsEnriching] = useState(false);
    // Pour afficher l'icône verte après enrichissement réussi
    const [isEnriched, setIsEnriched] = useState(false);

    // --- Email dialog state
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [emailDialogTo, setEmailDialogTo] = useState('');
    const [emailDialogSubject, setEmailDialogSubject] = useState('');
    const [emailDialogBody, setEmailDialogBody] = useState('');
    const [emailSendIndividually, setEmailSendIndividually] = useState(false);
    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    // Nouveaux hooks d'état pour infos complémentaires (Pappers)
    const [siren, setSiren] = useState('');
    const [siretSiegeSocial, setSiretSiegeSocial] = useState('');
    const [formeJuridique, setFormeJuridique] = useState('');
    const [codeNaf, setCodeNaf] = useState('');
    const [libelleCodeNaf, setLibelleCodeNaf] = useState('');
    const [dateCreation, setDateCreation] = useState('');
    // Ajout d'un nouvel état pour secteur
    const [secteur, setSecteur] = useState('');
    // Onglets activité
    const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'interactions' | 'reminders' | 'files' | 'emails' | 'calls' | 'team' | 'tasks'>('all');
    // Compteurs pour les onglets
    const [emailCount, setEmailCount] = useState(0);
    const [callCount, setCallCount] = useState(0);
    const [noteCount, setNoteCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [fileCount, setFileCount] = useState(0);
    const [teamCount, setTeamCount] = useState(0);
    // Fichiers - dialog et fichier sélectionné
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    // Fonction pour uploader le fichier dans Supabase Storage
    const uploadFile = async () => {
      if (!selectedFile) return;
      const validExtensions = ['pdf', 'png', 'jpeg', 'jpg'];
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !validExtensions.includes(fileExt)) {
        toast.error("Format non supporté. Formats autorisés : PDF, PNG, JPEG, JPG.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Fichier trop volumineux (max 5 Mo)");
        return;
      }

      const fileName = `${contactId}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('files')
        .upload(fileName, selectedFile);

      if (error) {
        toast.error("Erreur lors de l'envoi : " + error.message);
      } else {
        toast.success("Fichier envoyé avec succès !");
        setSelectedFile(null);
        setIsFileDialogOpen(false);
        // Charger la liste des fichiers après upload, avec limite 100 et filtrage par contactId
        const { data, error: fetchError } = await supabase.storage.from('files').list('', {
          limit: 100
        });
        const filteredFiles = (data || []).filter(file => file.name.startsWith(`${contactId}-`));
        if (fetchError) {
          toast.error("Erreur lors du chargement des fichiers : " + fetchError.message);
        } else {
          setFiles(filteredFiles.length > 0 ? await Promise.all(
            filteredFiles.map(async (file) => {
              const { data: urlData } = supabase.storage.from('files').getPublicUrl(file.name);
              return {
                name: file.name,
                size: file.metadata?.size || 0,
                uploaded_at: file.created_at || file.updated_at || new Date().toISOString(),
                url: urlData.publicUrl,
              };
            })
          ) : []);
        }
      }
    };
    // Charger la liste des fichiers au chargement du composant (tab 'files')
    useEffect(() => {
      const fetchFiles = async () => {
        const { data, error: fetchError } = await supabase.storage.from('files').list('', {
          limit: 100
        });
        const filteredFiles = (data || []).filter(file => file.name.startsWith(`${contactId}-`));
        if (fetchError) {
          // Optionally show error
          // toast.error("Erreur lors du chargement des fichiers : " + fetchError.message);
          setFiles([]);
        } else {
          setFiles(filteredFiles.length > 0 ? await Promise.all(
            filteredFiles.map(async (file) => {
              const { data: urlData } = supabase.storage.from('files').getPublicUrl(file.name);
              return {
                name: file.name,
                size: file.metadata?.size || 0,
                uploaded_at: file.created_at || file.updated_at || new Date().toISOString(),
                url: urlData.publicUrl,
              };
            })
          ) : []);
          setFileCount(filteredFiles.length);
        }
      };
      fetchFiles();
    }, [contactId]);
    // Notes state
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [notes, setNotes] = useState<any[]>([]);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

    // Tasks dialog states
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    // Tasks state
    const [tasks, setTasks] = useState<any[]>([]);

    // Add task function
    const addTask = async () => {
      const { error } = await supabase.from('tasks').insert([{
        title: taskTitle,
        description: taskDescription,
        due_date: taskDueDate,
        contact_id: contactId,
      }]);
      if (error) {
        toast.error("Erreur lors de la création de la tâche : " + error.message);
      } else {
        toast.success("Tâche créée !");
        setIsTaskDialogOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDueDate('');
        await fetchTasks();
      }
    };

    // Fonction pour récupérer les tâches liées à ce contact
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('contact_id', contactId);
      if (!error) {
        setTasks(data || []);
        setTaskCount((data || []).length);
      }
    };

    // Fonction pour récupérer les notes liées à ce contact
    const fetchNotes = async () => {
      const { data, error } = await supabase.from('notes').select('*').eq('contact_id', contactId);
      if (!error) {
        setNotes(data || []);
        setNoteCount((data || []).length);
      }
    };
    // Ajoute une note avec appel à Supabase
    const addNote = async () => {
      const user = await supabase.auth.getUser();
      console.log("Current user:", user.data.user);
      const author = user.data.user?.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase.from('notes').insert([{
        title: noteTitle,
        content: noteContent,
        contact_id: contactId,
        author,
      }]);

      if (error) {
        toast.error("Erreur lors de la création de la note : " + error.message);
      } else {
        toast.success("Note créée !");
        setIsNoteDialogOpen(false);
        setNoteTitle('');
        setNoteContent('');
        await fetchNotes();
      }
    };
    // Onglets principaux (Aperçu / Activité)
    const [mainTab, setMainTab] = useState<'overview' | 'activity'>('activity');
    // Ajout d'un état local pour tags
    const [tags, setTags] = useState('');

    // State for CreateContactDrawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Hooks d'édition pour les champs éditables
    const [isEditingWebsite, setIsEditingWebsite] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingLinkedin, setIsEditingLinkedin] = useState(false);
    const [isEditingInstagram, setIsEditingInstagram] = useState(false);
    const [isEditingFirstname, setIsEditingFirstname] = useState(false);
    const [isEditingLastname, setIsEditingLastname] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
    const [editedWebsite, setEditedWebsite] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
    const [editedLinkedin, setEditedLinkedin] = useState('');
    const [editedInstagram, setEditedInstagram] = useState('');
    const [editedFirstname, setEditedFirstname] = useState('');
    const [editedLastname, setEditedLastname] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedJobTitle, setEditedJobTitle] = useState('');

    useEffect(() => {
        const fetchContact = async () => {
            // 1. Charger le contact sans jointure
            const { data: contactData } = await supabase
                .from('contacts')
                .select('*')
                .eq('id', contactId)
                .single();

            // 2. Charger les liaisons contact_lists
            const { data: links } = await supabase
                .from('contact_lists')
                .select('list_id')
                .eq('contact_id', contactId);

            const listIds = links?.map(link => link.list_id) || [];

            // 3. Charger les listes correspondantes
            const { data: listsData } = await supabase
                .from('lists')
                .select('*')
                .in('id', listIds);

            // 4. Composer le contact enrichi
            const fullContact = { ...contactData, lists: listsData || [] };
            setContact(fullContact);
            setEmail(contactData?.email || '');
            setPhone(contactData?.phone || '');
            setAddress(contactData?.address || '');
            setCompanyName(contactData?.company_name || '');
            setWebsite(contactData?.website || '');
            setRevenue(contactData?.revenue || '');
            setSiren(contactData?.siren || '');
            setSiretSiegeSocial(contactData?.siret_siege_social || '');
            setFormeJuridique(contactData?.forme_juridique || '');
            setCodeNaf(contactData?.code_naf || '');
            setLibelleCodeNaf(contactData?.libelle_code_naf || '');
            setDateCreation(contactData?.date_creation || '');
            setSecteur(contactData?.secteur || '');
            setEditedWebsite(contactData?.website || '');
            // Initialisation des champs éditables
            setEditedFirstname(contactData?.firstname || '');
            setEditedLastname(contactData?.lastname || '');
            setEditedEmail(contactData?.email || '');
            setEditedJobTitle(contactData?.role || ''); // Ajout pour initialiser le rôle éditable
            setEditedAddress(contactData?.address || '');
            setEditedLinkedin(contactData?.linkedin || '');
            setEditedInstagram(contactData?.instagram || '');
            // Ajout de l'initialisation des tags
            setTags(contactData?.tags || '');
            setTeamCount(contactData?.company_name ? 1 : 0);
            // Initialiser le champ "À" du Dialog email
            setEmailDialogTo(contactData?.email || '');
            fetchNotes();
            fetchTasks();
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
                tags,
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
                    tags,
                } : prev
            );
        } catch (error: any) {
            toast.error(`Erreur : ${error.message}`);
        }
    };

    // Fonction pour associer une organisation depuis la modale
    const handleCompanySelection = async (companyName: string, companyDomain: string) => {
        try {
            const { error } = await supabase.from('contacts').update({
                company_name: companyName,
                website: companyDomain,
            }).eq('id', contactId);

            if (error) throw new Error(error.message);

            toast.success("Organisation associée avec succès !");
            setCompanyName(companyName);
            setWebsite(companyDomain);
            setContact((prev: any) => prev ? { ...prev, company_name: companyName, website: companyDomain } : prev);
        } catch (err: any) {
            toast.error("Erreur lors de l'association à l'organisation : " + err.message);
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

    // Détermine si le contact est une personne
    const isPerson = contact?.contact_type === 'person';
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
                        <div className="flex items-center gap-3">
                          {contact?.website && (
                            <div className="h-10 w-10 flex items-center justify-center rounded-md border">
                              <img
                                src={`https://logo.clearbit.com/${contact.website}`}
                                alt="logo"
                                className="h-6 w-6 object-contain"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-lg font-medium text-sidebar-foreground">
                              <span>
                                {contact?.contact_type === 'person'
                                  ? `${contact?.firstname || ''} ${contact?.lastname || ''}`.trim()
                                  : contact?.company_name}
                              </span>
                              {contact?.id && (
                                <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  ID: {contact.id}
                                </span>
                              )}
                            </div>
                            {contact?.contact_type === 'person' && (
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                                {contact?.company_name && (
                                  <span className="bg-muted px-2 py-0.5 rounded-full">
                                    {contact.company_name}
                                  </span>
                                )}
                                {contact?.updated_at && (
                                  <span className="bg-muted px-2 py-0.5 rounded-full">
                                    Modifié le {new Date(contact.updated_at).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            {/* Email Compose Button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 rounded-full px-3 py-1"
                                  onClick={() => setIsEmailDialogOpen(true)}
                                >
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
                    {/* Email Compose Dialog */}
                    <SendTestEmailDialog
                      open={isEmailDialogOpen}
                      onOpenChange={setIsEmailDialogOpen}
                      to={emailDialogTo}
                      subject={emailDialogSubject}
                      body={emailDialogBody}
                      senderName={senderName}
                      senderEmail={senderEmail}
                      onToChange={setEmailDialogTo}
                      onSubjectChange={setEmailDialogSubject}
                      onBodyChange={setEmailDialogBody}
                      onSenderNameChange={setSenderName}
                      onSenderEmailChange={setSenderEmail}
                      recipients={[]}
                    />

                   
                    <div className="grid grid-cols-12 gap-6 p-8 items-start">
                      {/* Colonne principale (onglets et contenu de l'activité) */}
                      <div className="col-span-8">
                        <div className="inline-flex items-center justify-start rounded-md bg-muted p-1 text-muted-foreground shadow-sm mb-4">
                          {[
                            { key: 'all', label: "Activité", icon: <Zap className="h-4 w-4" /> },
                            { key: 'emails', label: "Emails", icon: <Mail className="h-4 w-4" />, count: emailCount },
                            { key: 'calls', label: "Appels", icon: <Phone className="h-4 w-4" />, count: callCount },
                            { key: 'team', label: isPerson ? "Organisation" : "Équipe", icon: <Users className="h-4 w-4" />, count: teamCount },
                            { key: 'notes', label: "Notes", icon: <FileText className="h-4 w-4" />, count: noteCount },
                            { key: 'tasks', label: "Tâches", icon: <CheckSquare className="h-4 w-4" />, count: taskCount },
                            { key: 'files', label: "Fichiers", icon: <Folder className="h-4 w-4" />, count: fileCount },
                          ].map((tab, idx) => (
                            <div
                              key={idx}
                              onClick={() => setActiveTab(tab.key as typeof activeTab)}
                              className={cn(
                                "data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-1 text-sm font-medium inline-flex items-center gap-1",
                                activeTab === tab.key
                                  ? "bg-white text-foreground shadow-sm"
                                  : "bg-muted text-muted-foreground hover:bg-accent cursor-pointer"
                              )}
                            >
                              {tab.icon}
                              <span>{tab.label}</span>
                              {'count' in tab && (
                                <span className="ml-1 text-[10px] bg-muted text-foreground/70 rounded px-1">
                                  {tab.count}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          {activeTab === 'all' && (
                            <div className="py-6 px-6">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h2 className="text-2xl font-bold tracking-tight">Activité</h2>
                                  <p className="text-muted-foreground text-lg">2025</p>
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl px-4 py-2">
                                      <PlusCircle className="h-4 w-4" />
                                      Ajouter une réunion
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Nouvelle réunion</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Input placeholder="Titre de la réunion" className="text-xl font-semibold" />
                                        <p className="text-muted-foreground text-sm">Ajouter une description</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-sm mb-1">Date et heure</p>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm">Aujourd’hui</span>
                                          <Input className="w-20 text-sm" defaultValue="04:59 PM" />
                                          <span>→</span>
                                          <Input className="w-20 text-sm" defaultValue="05:29 PM" />
                                          <span className="text-sm text-muted-foreground">(30m)</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-sm mb-1">Participants</p>
                                        <div className="flex items-center gap-3">
                                          <div className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">T</div>
                                          <span className="text-sm font-medium">Thomas Defossez</span>
                                          <span className="text-xs bg-muted rounded px-2 py-0.5">Hôte</span>
                                          <span className="text-sm text-muted-foreground">gitamog306@pricegh.com</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground text-sm mb-1">Enregistrements liés</p>
                                        <div className="flex items-center gap-2">
                                          <img src="https://logo.clearbit.com/apple.com" className="h-5 w-5" />
                                          <span className="text-sm font-medium">Apple</span>
                                          <span className="text-sm text-muted-foreground">apple.com</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-6">
                                      <Button variant="ghost">Annuler</Button>
                                      <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                                        Créer une réunion
                                        <kbd className="ml-2 text-xs text-white/80">⌘↵</kbd>
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <div className="inline-block bg-muted text-sm rounded px-3 py-1 mb-4 font-medium text-muted-foreground">
                                Cette semaine
                              </div>
                              <div className="space-y-6 text-sm text-muted-foreground">
                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3">
                                    <div className="bg-muted border p-1 rounded-full">
                                      <Settings className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="text-foreground">Apple a été créé par <span className="font-medium text-foreground">Attio system</span></span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">il y a 1 jour</div>
                                </div>

                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3">
                                    <div className="bg-muted border p-1 rounded-full">
                                      <Settings className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="text-foreground"><span className="font-medium text-foreground">Attio system</span> a modifié <Globe className="inline-block h-4 w-4 mx-1 text-muted-foreground" /> <span className="underline decoration-dotted text-foreground">Domaines</span></span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">il y a 1 jour</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'emails' && (
                            <div className="py-8 px-6">
                              <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Emails</h2>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                    <Settings className="h-4 w-4" />
                                    Filtres
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                    <BookUser className="h-4 w-4" />
                                    Gérer les accès
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-col items-center justify-center py-20">
                                <div className="mb-6">
                                  <img
                                    src="/icons/contact-email.png"
                                    alt="Aucun email"
                                    className="h-28 w-auto max-w-xs opacity-80"
                                  />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Aucun email</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-sm">
                                  Aucun email n’apparaît ici.<br />
                                  Certains emails peuvent être masqués en raison des permissions.
                                </p>
                              </div>
                            </div>
                          )}

                          {activeTab === 'calls' && (
                            <div className="py-8 px-6">
                              <h2 className="text-xl font-semibold mb-6">Appels</h2>
                              <div className="flex flex-col items-center justify-center py-20">
                                <div className="mb-6">
                                  <img
                                    src="/icons/calls-empty.svg"
                                    alt="Aucun appel"
                                    className="h-20 w-20 opacity-60"
                                  />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Enregistrements d’appel</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-sm">
                                  Aucun enregistrement d’appel pour l’instant<br />
                                  Les appels enregistrés apparaîtront ici.
                                </p>
                              </div>
                            </div>
                          )}

                          {activeTab === 'team' && (
                            <div className="py-8 px-6">
                              <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                  {isPerson ? "Organisation" : "Team"}
                                </h2>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1 rounded-full px-3 py-1"
                                    >
                                      + {contact?.company_name ? "Modifier la société" : "Ajouter une société"}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>{contact?.company_name ? "Modifier la société" : "Ajouter une société"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input placeholder="Rechercher une société..." />
                                      <div className="space-y-2">
                                        {[
                                          { name: "Free Telecom", domain: "freetelecom.fr" },
                                          { name: "laposte.net", domain: "laposte.net" },
                                          { name: "Free", domain: "free.fr" },
                                          { name: "Université Gustave Eiffel", domain: "univ-eiffel.fr" },
                                          { name: "Les Inrockuptibles", domain: "mail.lesinrockuptibles.fr" },
                                          { name: "CABINET MOULIN DES PRES", domain: "moulin-des-pres.fr" }
                                        ].map((org, index) => (
                                          <div
                                            key={index}
                                            onClick={() => handleCompanySelection(org.name, org.domain)}
                                            className="flex items-center justify-between px-3 py-2 border rounded hover:bg-muted cursor-pointer"
                                          >
                                            <div>
                                              <div className="font-medium">{org.name}</div>
                                              <div className="text-muted-foreground text-sm">{org.domain}</div>
                                            </div>
                                            <div className="text-blue-600">
                                              <ImageIcon className="h-4 w-4" />
                                            </div>
                                          </div>
                                        ))}
                                        <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-blue-600 hover:underline">
                                          <PlusCircle className="h-4 w-4" />
                                          Ajouter une société
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {/* Display company details if available */}
                              {contact?.company_name && (
                                <div className="flex flex-col space-y-6">
                                  <div className="border rounded-md p-4 space-y-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={`https://logo.clearbit.com/${contact?.website}`}
                                        alt={`${companyName} logo`}
                                        className="h-10 w-10 rounded-md border"
                                      />
                                      <div className="text-lg font-medium underline decoration-muted">
                                        {companyName}
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Description</span>
                                      </div>
                                      <div className="text-sm">
                                        {contact?.description || 'Aucune description disponible'}
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span>Domaines</span>
                                      </div>
                                      <a
                                        href={`https://${contact?.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 text-sm hover:underline"
                                      >
                                        {contact?.website}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'notes' && (
                            <div className="py-8 px-6">
                              <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Notes</h2>
                                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                      <FileText className="h-4 w-4" />
                                      Nouvelle note
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Nouvelle note</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input
                                        placeholder="Titre de la note"
                                        value={noteTitle}
                                        onChange={e => setNoteTitle(e.target.value)}
                                      />
                                      <textarea
                                        placeholder="Contenu de la note"
                                        value={noteContent}
                                        onChange={e => setNoteContent(e.target.value)}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-6">
                                      <Button variant="ghost" onClick={() => setIsNoteDialogOpen(false)}>Annuler</Button>
                                      <Button onClick={addNote} className="bg-violet-600 hover:bg-violet-700 text-white">
                                        Créer la note
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {notes.length > 0 && (
                                <div className="space-y-4">
                                  {notes.map(note => (
                                    <div key={note.id} className="border rounded-md p-4 bg-gray-50">
                                      <div className="text-sm font-semibold mb-1">{note.title}</div>
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {note.content || 'Cette note ne contient pas de contenu.'}
                                      </div>
                                      <div className="text-xs text-muted-foreground flex justify-between">
                                        <span>{note.author}</span>
                                        <span>{new Date(note.created_at).toLocaleDateString('fr-FR')}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {notes.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <div className="mb-6">
                                    <img
                                      src="/icons/notes-empty.svg"
                                      alt="Aucune note"
                                      className="h-20 w-20 opacity-60"
                                    />
                                  </div>
                                  <h3 className="text-xl font-semibold mb-2">Aucune note</h3>
                                  <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                                    Créez une note à l’aide du bouton ci-dessous.
                                  </p>
                                  <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                        <FileText className="h-4 w-4" />
                                        Nouvelle note
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Nouvelle note</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Input
                                          placeholder="Titre de la note"
                                          value={noteTitle}
                                          onChange={e => setNoteTitle(e.target.value)}
                                        />
                                        <textarea
                                          placeholder="Contenu de la note"
                                          value={noteContent}
                                          onChange={e => setNoteContent(e.target.value)}
                                          className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2 mt-6">
                                        <Button variant="ghost" onClick={() => setIsNoteDialogOpen(false)}>Annuler</Button>
                                        <Button onClick={addNote} className="bg-violet-600 hover:bg-violet-700 text-white">
                                          Créer la note
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'tasks' && (
                            <div className="py-8 px-6">
                              <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Tâches</h2>
                                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                      <CheckSquare className="h-4 w-4" />
                                      Nouvelle tâche
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Nouvelle tâche</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input
                                        placeholder="Titre de la tâche"
                                        value={taskTitle}
                                        onChange={e => setTaskTitle(e.target.value)}
                                      />
                                      <textarea
                                        placeholder="Description"
                                        value={taskDescription}
                                        onChange={e => setTaskDescription(e.target.value)}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                      />
                                      <Input
                                        type="date"
                                        value={taskDueDate}
                                        onChange={e => setTaskDueDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-6">
                                      <Button variant="ghost" onClick={() => setIsTaskDialogOpen(false)}>Annuler</Button>
                                      <Button onClick={addTask} className="bg-violet-600 hover:bg-violet-700 text-white">
                                        Créer la tâche
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {tasks.length > 0 ? (
                                <div className="space-y-4">
                                  {tasks.map((task) => (
                                    <div key={task.id} className="border rounded-md p-4 bg-gray-50">
                                      <div className="text-sm font-semibold mb-1">{task.title}</div>
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {task.description || 'Aucune description'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        À rendre pour le {new Date(task.due_date).toLocaleDateString('fr-FR')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <div className="mb-6">
                                    <img
                                      src="/icons/tasks-empty.svg"
                                      alt="Aucune tâche"
                                      className="h-20 w-20 opacity-60"
                                    />
                                  </div>
                                  <h3 className="text-xl font-semibold mb-2">Aucune tâche</h3>
                                  <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                                    Créez une tâche à l’aide du bouton ci-dessus.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          {activeTab === 'files' && (
                            <div className="py-8 px-6">
                              {/* Content for Files tab */}
                              <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Fichiers</h2>
                                <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                      <Folder className="h-4 w-4" />
                                      Ajouter un fichier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Ajouter un fichier</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input
                                        type="file"
                                        accept="*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-6">
                                      <Button variant="ghost" onClick={() => setIsFileDialogOpen(false)}>Annuler</Button>
                                      <Button onClick={uploadFile} className="bg-violet-600 hover:bg-violet-700 text-white">
                                        Envoyer
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {/* Files list */}
                              {/* Suppose files are loaded into a 'files' state variable */}
                              {/*
                                Example:
                                const [files, setFiles] = useState<FileMeta[]>([]);
                                FileMeta = { name: string, uploaded_at: string, size: number, url: string }
                                You should fetch files from Supabase and setFiles accordingly.
                              */}
                              {/* BEGIN Files List */}
                              {Array.isArray(files) && files.length > 0 ? (
                                <div className="space-y-3">
                                  {files.map((file, idx) => (
                                    <div key={file.name || idx} className="flex justify-between items-center p-3 border rounded-md shadow-sm hover:bg-muted">
                                      <div className="flex items-center gap-2">
                                        <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
                                          <ImageIcon className="h-5 w-5" />
                                        </div>
                                        <div className="font-medium">{file.name}</div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-muted-foreground text-sm">{format(new Date(file.uploaded_at), 'PPP')}</div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent>
                                            <DropdownMenuItem>
                                              Renommer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <a
                                                href={file.url}
                                                download={file.name}
                                                className="flex items-center gap-2"
                                                style={{ width: "100%" }}
                                              >
                                                Télécharger ({formatFileSize(file.size)})
                                              </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                              Supprimer
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <div className="mb-6">
                                    <img
                                      src="/icons/files-empty.svg"
                                      alt="No files"
                                      className="h-20 w-20 opacity-60"
                                    />
                                  </div>
                                  <h3 className="text-xl font-semibold mb-2">Aucun fichier</h3>
                                  <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                                    Aucun fichier n’a encore été envoyé pour cette fiche.
                                  </p>
                                  <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full px-3 py-1">
                                        <Folder className="h-4 w-4" />
                                        Ajouter un fichier
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Ajouter un fichier</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Input
                                          type="file"
                                          accept="*"
                                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2 mt-6">
                                        <Button variant="ghost" onClick={() => setIsFileDialogOpen(false)}>Annuler</Button>
                                        <Button onClick={uploadFile} className="bg-violet-600 hover:bg-violet-700 text-white">
                                        Envoyer
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                              {/* END Files List */}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Colonne latérale droite avec Tabs */}
                      <div className="col-span-4 min-w-[300px] border-l p-8 rounded space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="inline-flex items-center justify-start rounded-md p-1 text-muted-foreground shadow-sm mb-4">
                            <TabsTrigger
                              value="details"
                              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-1 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Détails
                            </TabsTrigger>
                            <TabsTrigger
                              value="comments"
                              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-1 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Commentaires <span className="ml-1 rounded-full bg-muted px-1 text-[10px]">0</span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="details" className="pt-4 text-sm">
                            <Accordion type="single" collapsible defaultValue="details">
                              <AccordionItem value="details">
                                <AccordionTrigger>Détails</AccordionTrigger>
                                <AccordionContent>
                                  {isPerson ? (
                                    <>
                                      {/* Firstname */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Prénom:</div>
                                          {isEditingFirstname ? (
                                            <input
                                              className="text-sm border rounded px-2 py-0.5"
                                              value={editedFirstname}
                                              onChange={e => setEditedFirstname(e.target.value)}
                                              onBlur={() => {
                                                setContact((prev: any) => prev ? { ...prev, firstname: editedFirstname } : prev);
                                                setIsEditingFirstname(false);
                                              }}
                                              autoFocus
                                            />
                                          ) : (
                                            <span
                                              onClick={() => setIsEditingFirstname(true)}
                                              className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                            >
                                              {editedFirstname}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Lastname */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Nom:</div>
                                          {isEditingLastname ? (
                                            <input
                                              className="text-sm border rounded px-2 py-0.5"
                                              value={editedLastname}
                                              onChange={e => setEditedLastname(e.target.value)}
                                              onBlur={() => {
                                                setContact((prev: any) => prev ? { ...prev, lastname: editedLastname } : prev);
                                                setIsEditingLastname(false);
                                              }}
                                              autoFocus
                                            />
                                          ) : (
                                            <span
                                              onClick={() => setIsEditingLastname(true)}
                                              className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                            >
                                              {editedLastname}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Email */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center w-full">
                                          <div className="text-muted-foreground">Email:</div>
                                          <input
                                            className="text-sm border rounded px-2 py-0.5 flex-1"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onBlur={async () => {
                                              const { error } = await supabase
                                                .from('contacts')
                                                .update({ email })
                                                .eq('id', contactId);
                                              if (!error) {
                                                setContact((prev: any) => prev ? { ...prev, email } : prev);
                                                setEditedEmail(email);
                                                toast.success("Email mis à jour avec succès !");
                                              } else {
                                                toast.error("Erreur lors de la mise à jour de l'email");
                                              }
                                            }}
                                          />
                                          {email && (
                                            <button
                                              onClick={() => {
                                                setEmail('');
                                                setEditedEmail('');
                                                setContact((prev: any) => prev ? { ...prev, email: '' } : prev);
                                              }}
                                              className="text-red-500 hover:text-red-700 px-2"
                                              title="Supprimer l'email"
                                            >
                                              ×
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {/* Rôle */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Rôle:</div>
                                          {isEditingJobTitle ? (
                                            <input
                                              className="text-sm border rounded px-2 py-0.5"
                                              value={editedJobTitle}
                                              onChange={e => setEditedJobTitle(e.target.value)}
                                              onBlur={async () => {
                                                const { error } = await supabase
                                                  .from('contacts')
                                                  .update({ role: editedJobTitle })
                                                  .eq('id', contactId);
                                                if (!error) {
                                                  setContact((prev: any) => prev ? { ...prev, role: editedJobTitle } : prev);
                                                  toast.success("Rôle mis à jour avec succès !");
                                                } else {
                                                  toast.error("Erreur lors de la mise à jour du rôle");
                                                }
                                                setIsEditingJobTitle(false);
                                              }}
                                              autoFocus
                                            />
                                          ) : (
                                            <span
                                              onClick={() => setIsEditingJobTitle(true)}
                                              className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                            >
                                              {editedJobTitle || 'Non renseigné'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Description */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Description:</div>
                                          <div>{contact?.description}</div>
                                        </div>
                                      </div>
                                     
                                      {/* Type */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Type:</div>
                                          <div>{contact?.contact_type}</div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Nom société (édition indépendante) */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex gap-1 items-center">
                                        <div className="text-muted-foreground">Nom société:</div>
                                        {isEditingCompanyName ? (
                                          <input
                                            className="text-sm border rounded px-2 py-0.5"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            onBlur={() => {
                                              handleCompanySave();
                                              setIsEditingCompanyName(false);
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <span
                                            onClick={() => setIsEditingCompanyName(true)}
                                            className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                          >
                                            {companyName || 'Non renseigné'}
                                          </span>
                                        )}
                                      </div>
                                      </div>
                                      {/* Tags (édition indépendante) */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Folder className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex gap-1 items-center">
                                        <div className="text-muted-foreground">Tags:</div>
                                        {isEditingTags ? (
                                          <input
                                            className="text-sm border rounded px-2 py-0.5"
                                            value={tags}
                                            onChange={e => setTags(e.target.value)}
                                            onBlur={() => {
                                              handleCompanySave();
                                              setIsEditingTags(false);
                                            }}
                                            autoFocus
                                          />
                                        ) : (
                                          <span
                                            onClick={() => setIsEditingTags(true)}
                                            className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                          >
                                            {tags || 'Non renseigné'}
                                          </span>
                                        )}
                                      </div>
                                      </div>
                                      {/* Website (editable Attio style) */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Website:</div>
                                          {isEditingWebsite ? (
                                            <input
                                              type="text"
                                              className="text-sm border rounded px-2 py-0.5"
                                              value={editedWebsite}
                                              onChange={(e) => setEditedWebsite(e.target.value)}
                                              onBlur={() => {
                                                setWebsite(editedWebsite);
                                                setIsEditingWebsite(false);
                                              }}
                                              autoFocus
                                            />
                                          ) : (
                                            <a
                                              className="text-sm text-blue-600 hover:underline bg-muted px-2 py-0.5 rounded"
                                              onClick={() => setIsEditingWebsite(true)}
                                              tabIndex={0}
                                              style={{ cursor: 'pointer' }}
                                            >
                                              {editedWebsite}
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                      {/* Email */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center w-full relative">
                                          <div className="text-muted-foreground">Email:</div>
                                          <input
                                            className="text-sm bg-muted px-2 py-0.5 rounded w-full pr-6"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onBlur={async () => {
                                              const { error } = await supabase
                                                .from('contacts')
                                                .update({ email })
                                                .eq('id', contactId);
                                              if (!error) {
                                                setContact((prev: any) => prev ? { ...prev, email } : prev);
                                                setEditedEmail(email);
                                                toast.success("Email mis à jour avec succès !");
                                              } else {
                                                toast.error("Erreur lors de la mise à jour de l'email");
                                              }
                                            }}
                                          />
                                          {email && (
                                            <button
                                              onClick={() => {
                                                setEmail('');
                                                setEditedEmail('');
                                                setContact((prev: any) => prev ? { ...prev, email: '' } : prev);
                                              }}
                                              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                                              title="Supprimer l'email"
                                            >
                                              ×
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {/* Secteur */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <Folder className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Sector:</div>
                                          <div>{secteur}</div>
                                        </div>
                                      </div>
                                      {/* Type */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 items-center">
                                          <div className="text-muted-foreground">Type:</div>
                                          <div>{contact?.contact_type}</div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="additional-info">
                                <AccordionTrigger>Informations additionnelles</AccordionTrigger>
                                <AccordionContent>
                                  {/* Adresse */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Adresse:</div>
                                      {isEditingAddress ? (
                                        <input
                                          className="text-sm border rounded px-2 py-0.5"
                                          value={editedAddress}
                                          onChange={e => setEditedAddress(e.target.value)}
                                          onBlur={() => {
                                            setAddress(editedAddress);
                                            setIsEditingAddress(false);
                                          }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onClick={() => setIsEditingAddress(true)}
                                          className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                        >
                                          {editedAddress || 'Non renseignée'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Code postal */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Code postal:</div>
                                      <div>{contact?.zipcode || 'Non renseigné'}</div>
                                    </div>
                                  </div>
                                  {/* Ville */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Ville:</div>
                                      <div>{contact?.city || 'Non renseigné'}</div>
                                    </div>
                                  </div>
                                  {/* Région */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Région:</div>
                                      <div>{contact?.region || 'Non renseigné'}</div>
                                    </div>
                                  </div>
                                  {/* Pays */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Pays:</div>
                                      <div>{contact?.country || 'Non renseigné'}</div>
                                    </div>
                                  </div>
                                  {/* LinkedIn */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">LinkedIn:</div>
                                      {isEditingLinkedin ? (
                                        <input
                                          className="text-sm border rounded px-2 py-0.5"
                                          value={editedLinkedin}
                                          onChange={e => setEditedLinkedin(e.target.value)}
                                          onBlur={() => {
                                            setContact((prev: any) => prev ? { ...prev, linkedin: editedLinkedin } : prev);
                                            setIsEditingLinkedin(false);
                                          }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onClick={() => setIsEditingLinkedin(true)}
                                          className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                        >
                                          {editedLinkedin || 'Non renseigné'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Instagram */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Instagram:</div>
                                      {isEditingInstagram ? (
                                        <input
                                          className="text-sm border rounded px-2 py-0.5"
                                          value={editedInstagram}
                                          onChange={e => setEditedInstagram(e.target.value)}
                                          onBlur={() => {
                                            setContact((prev: any) => prev ? { ...prev, instagram: editedInstagram } : prev);
                                            setIsEditingInstagram(false);
                                          }}
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          onClick={() => setIsEditingInstagram(true)}
                                          className="cursor-pointer text-sm bg-muted px-2 py-0.5 rounded"
                                        >
                                          {editedInstagram || 'Non renseigné'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Sous-secteur */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1 items-center">
                                      <div className="text-muted-foreground">Sous-secteur:</div>
                                      <div>{contact?.sous_secteur || 'Non renseigné'}</div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                            <AccordionItem value="lists">
                              <AccordionTrigger>Listes</AccordionTrigger>
                              <AccordionContent>
                                {contact?.lists && contact.lists.length > 0 ? (
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {contact.lists.map((list: any, index: number) => (
                                      <li key={index} className="bg-muted px-2 py-0.5 rounded">
                                        {list.name}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-muted-foreground text-sm italic">Ce contact n’est associé à aucune liste pour le moment.</div>
                                )}
                              </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </TabsContent>

                          <TabsContent value="comments" className="pt-4">
                            <h3 className="text-base font-semibold mb-4">Tous les commentaires</h3>
                            <div className="border border-blue-500 rounded-xl px-4 py-3 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                  T
                                </div>
                                <input
                                  type="text"
                                  placeholder="Ajouter un commentaire..."
                                  className="flex-1 border-none outline-none text-sm placeholder:text-muted-foreground"
                                />
                                <Button className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-md">
                                  Commenter
                                </Button>
                              </div>
                              <div className="flex gap-4 pl-9 text-muted-foreground text-lg items-center">
                                <span>🙂</span>
                                <span>@</span>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
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