// @ts-nocheck
"use client"

import { Mail, User, Languages, Briefcase } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CompanyLogo } from "@/components/ui/CompanyLogo"
import { Label } from "@/components/ui/label"
import { PhoneField } from "@/components/ui/PhoneField"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, FC } from "react"

function extractDomain(url: string): string {
  try {
    const domain = new URL(url.startsWith("http") ? url : "https://" + url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
}
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandEmpty
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import clsx from "clsx"
import AddressAutocomplete from "./AddressAutocomplete"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContactCreated?: () => void;
    triggerButton?: React.ReactNode;
}

export const CreateContactDrawer: FC<Props> = ({ open, onOpenChange, onContactCreated, triggerButton }) => {
    const [loading, setLoading] = useState(false)
    const [contactType, setContactType] = useState<"person" | "organization">("person")

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [title, setTitle] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState<string | undefined>("")
    const [gender, setGender] = useState("unspecified")
    const [language, setLanguage] = useState("")
    // Organizations selection (multiple)
    const [organizationIds, setOrganizationIds] = useState<string[]>([])
    const [tags, setTags] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [siret, setSiret] = useState("")
    const [address, setAddress] = useState("")
    const [zipcode, setZipcode] = useState("")
    const [city, setCity] = useState("")
    const [region, setRegion] = useState("")
    const [country, setCountry] = useState("")
    const [website, setWebsite] = useState("")
    const [linkedin, setLinkedin] = useState("")
    const [instagram, setInstagram] = useState("")
    const [periodicity, setPeriodicity] = useState("")
    const [mediaType, setMediaType] = useState<string[]>([])
    const [secteur, setSecteur] = useState("")
    const [sousSecteur, setSousSecteur] = useState("")
    // Ajout du champ rôle
    const [role, setRole] = useState("")
    // Secteurs Secodip
    const [secteurs, setSecteurs] = useState<{ id: string; nom: string }[]>([]);
    // Sous-secteurs Secodip
    const [sousSecteurs, setSousSecteurs] = useState<{ id: string; libelle: string; secteur_id: string }[]>([]);
    // Charger tous les sous-secteurs au chargement pour popover hiérarchique
    useEffect(() => {
      const fetchSousSecteurs = async () => {
        const { data } = await supabase
          .from("sous_secteurs_secodip")
          .select("id, libelle, secteur_id")
          .order("libelle", { ascending: true });
        if (data) setSousSecteurs(data);
      };
      fetchSousSecteurs();
    }, []);
    const [editeur, setEditeur] = useState("")
    // Support is now an array of strings for multi-select
    const [support, setSupport] = useState<string[]>([])
    // Liste dynamique des supports
    const [supportsList, setSupportsList] = useState<{ label: string; value: string; editeur?: string }[]>([]);


    useEffect(() => {
      const fetchSupports = async () => {
        const { data, error } = await supabase
          .from('supports')
          .select('label, value, editeur')
          .eq('is_active', true);
        if (data) setSupportsList(data);
      };

      const fetchSecteurs = async () => {
        const { data, error } = await supabase
          .from('secteurs_secodip')
          .select('id, nom')
          .order('nom', { ascending: true });
        if (data) setSecteurs(data);
      };

      fetchSupports();
      fetchSecteurs();
    }, []);

    // Champs complémentaires pour organisations
    const [formeJuridique, setFormeJuridique] = useState("")
    const [siren, setSiren] = useState("")
    const [libelleCodeNaf, setLibelleCodeNaf] = useState("")
    const [codeNaf, setCodeNaf] = useState("")
    const [dateCreation, setDateCreation] = useState("")
    const [revenue, setRevenue] = useState("")

    // Organisations state
    const [organisations, setOrganisations] = useState<{ id: string; name: string }[]>([])
    // Controlled input for new tag
    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        const fetchOrganisations = async () => {
            const { data, error } = await supabase.from("organisations").select("id, name")
            if (!error && data) setOrganisations(data)
        }
        fetchOrganisations()
    }, [])

    // Hunter.io domain search
    async function fetchHunterData(domain: string) {
      try {
        const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=b30ab576734e14e2f0be9a7243aa462d85c6cfdd`);
        const data = await response.json();
        return data.data;
      } catch (e) {
        console.error("Erreur Hunter.io", e);
        return null;
      }
    }

    async function handleSiretLookup() {
        if (!siret.trim()) return;
        try {
            const siretTrimmed = siret.trim();
            const isSiret = /^\d{14}$/.test(siretTrimmed);
            const isSiren = /^\d{9}$/.test(siretTrimmed);

            const url = isSiret
                ? `https://api.pappers.fr/v2/entreprise?siret=${siretTrimmed}&api_token=055e4e2e8825bb256b5f1d83cabde91de31c3b96ba42c744`
                : isSiren
                ? `https://api.pappers.fr/v2/entreprise?siren=${siretTrimmed}&api_token=055e4e2e8825bb256b5f1d83cabde91de31c3b96ba42c744`
                : `https://api.pappers.fr/v2/recherche?q=${encodeURIComponent(siretTrimmed)}&api_token=055e4e2e8825bb256b5f1d83cabde91de31c3b96ba42c744`;

            const response = await fetch(url);
            const data = await response.json();

            let entreprise = data;
            if (data.resultats && data.resultats.length > 0) {
                entreprise = data.resultats[0];
            }

            if (!entreprise || (!entreprise.siege && !entreprise.nom_entreprise)) {
                toast.error("Aucun résultat trouvé via Pappers.");
                return;
            }

            setCompanyName(entreprise.nom_entreprise || "");
            setAddress(entreprise.siege?.adresse_ligne || "");
            setZipcode(entreprise.siege?.code_postal || "");
            setCity(entreprise.siege?.ville || "");
            setRegion(entreprise.siege?.region || "");
            setCountry("France");
            setSiren(entreprise.siren || "");
            setSiret(entreprise.siege?.siret || siretTrimmed);
            setFormeJuridique(entreprise.forme_juridique || "");
            setCodeNaf(entreprise.code_naf || "");
            setLibelleCodeNaf(entreprise.libelle_code_naf || "");
            setDateCreation(entreprise.date_creation || "");
            setRevenue(entreprise.dernier_ca?.toString() || "");

            // --- Hunter.io enrichment ---
            const domain = extractDomain(entreprise.site_web || entreprise.nom_entreprise);
            const hunterData = await fetchHunterData(domain);
            if (hunterData?.emails?.length) {
              setEmail((hunterData.emails[0] && hunterData.emails[0].value) || email);
            }

            toast.success("Informations récupérées via Pappers");
        } catch (err) {
            console.error("Erreur fetch Pappers:", err);
            toast.error("Erreur lors de la récupération depuis Pappers");
        }
    }

    async function handleSaveContact() {
        if (!email.trim()) {
            toast.error("Une adresse email est requise.")
            return
        }
        setLoading(true)
        // Si contactType est "organization", insérer d'abord dans organisations
        let organisationId = null
        if (contactType === "organization") {
            if (!companyName.trim()) {
                toast.error("Le nom de l'entreprise est requis pour créer une organisation.")
                setLoading(false)
                return
            }

            const { data: orgData, error: orgError } = await supabase.from("organisations").insert([
                {
                    name: companyName,
                    siret_siege_social: siret,
                    forme_juridique: formeJuridique,
                    siren: siren,
                    libelle_code_naf: libelleCodeNaf,
                    code_naf: codeNaf,
                    date_creation: dateCreation || null,
                    revenue: revenue,
                    address,
                    zipcode,
                    city,
                    region,
                    country,
                    website,
                    linkedin,
                    instagram,
                    periodicity,
                    media_type: mediaType.join(','), // multi
                    tags,
                    editeur,
                    support,
                }
            ]).select("id").single()

            if (orgError) {
                console.error("Erreur insertion organisation :", orgError)
                toast.error(`Erreur lors de l'ajout de l'organisation : ${orgError.message}`)
                setLoading(false)
                return
            }

            organisationId = typeof orgData?.id === "string" && orgData.id.match(/^[0-9a-fA-F-]{36}$/)
              ? orgData.id
              : null;
        }
        const { data: contactData, error } = await supabase.from("contacts").insert([
            {
                contact_type: contactType,
                firstname: firstName,
                lastname: lastName,
                title,
                email,
                phone,
                gender,
                // salutation: undefined, // Retiré car champ non utilisé ou supprimé
                company_name: companyName,
                language,
                organisation_id: organisationId,
                address,
                zipcode,
                city,
                region,
                country,
                website,
                linkedin,
                instagram,
                periodicity,
                media_type: mediaType.join(','), // multi
                tags,
                secteur,
                sous_secteur: sousSecteur && sousSecteur.match(/^[0-9a-fA-F-]{36}$/) ? sousSecteur : null,
                editeur,
                support,
                role,
            },
        ]).select("*").single()
        // Insert into contact_organisation if needed
        if (contactType === "person" && organizationIds.length > 0 && contactData?.id) {
            await supabase.from("contact_organisation").insert(
                organizationIds
                    .filter((orgId) => typeof orgId === "string" && orgId.match(/^[0-9a-fA-F-]{36}$/))
                    .map((orgId) => ({
                        contact_id: contactData.id,
                        organisation_id: orgId
                    }))
            )
        }
        setLoading(false)
        if (error) {
            toast.error(`Erreur : ${error.message}`)
        } else {
            toast.success("Contact ajouté avec succès")
            onOpenChange(false)
            onContactCreated?.()
            // Réinitialisation des champs du formulaire
            setFirstName("")
            setLastName("")
            setTitle("")
            setEmail("")
            setPhone("")
            setGender("unspecified")
            setLanguage("")
            setOrganizationIds([])
            setTags("")
            setCompanyName("")
            setSiret("")
            setAddress("")
            setZipcode("")
            setCity("")
            setRegion("")
            setCountry("")
            setWebsite("")
            setLinkedin("")
            setInstagram("")
            setPeriodicity("")
            setMediaType([])
            setSecteur("")
            setSousSecteur("")
            setEditeur("")
            setSupport([])
            setRole("")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {triggerButton && (
                <SheetTrigger asChild>
                    {triggerButton}
                </SheetTrigger>
            )}
            <SheetContent
                side="right"
                className="p-0 flex flex-col"
                style={{ width: "800px", maxWidth: "800px" }}
            >
                <div className="p-6 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg">Créer un contact</SheetTitle>
                  </div>
                </div>

                <div className="flex-1 overflow-y-scroll p-6 space-y-8">
                    <div className="flex gap-4">
                        <Button variant={contactType === "person" ? "default" : "outline"} onClick={() => setContactType("person")}>
                            Personne
                        </Button>
                        <Button variant={contactType === "organization" ? "default" : "outline"} onClick={() => setContactType("organization")}>
                            Organisation
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {contactType === "person" ? (
                          <>
                            <div>
                              <Label className="mb-1 block">Prénom</Label>
                              <div className="relative">
                                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  className="h-9 text-sm pl-8"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="mb-1 block">Nom</Label>
                              <div className="relative">
                                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  className="h-9 text-sm pl-8"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="mb-1 block">Email *</Label>
                              <div className="relative">
                                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  className="h-9 text-sm pl-8"
                                />
                              </div>
                            </div>
                            <div>
                              <PhoneField value={phone} onChange={setPhone} className="h-9 text-sm" />
                            </div>
                            <div>
                              <Label className="mb-1 block">Langue</Label>
                              <Select value={language} onValueChange={setLanguage}>
                                <div className="relative">
                                  <Languages className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <SelectTrigger className="h-9 text-sm pl-8">
                                    <SelectValue placeholder="Choisir une langue" />
                                  </SelectTrigger>
                                </div>
                                <SelectContent>
                                  <SelectItem value="french">Français</SelectItem>
                                  <SelectItem value="english">Anglais</SelectItem>
                                  <SelectItem value="spanish">Espagnol</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="mb-1 block">Organisations</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="h-9 text-sm w-full justify-between">
                                    {organizationIds.length > 0
                                      ? organizationIds
                                          .map((id) => organisations.find((o) => o.id === id)?.name)
                                          .filter(Boolean)
                                          .join(", ")
                                      : "Ajouter une organisation"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Rechercher une organisation" />
                                    <CommandList>
                                      {organisations.map((org) => (
                                        <CommandItem
                                          key={org.id}
                                          onSelect={() => {
                                            if (!organizationIds.includes(org.id)) {
                                              setOrganizationIds([...organizationIds, org.id]);
                                            }
                                          }}
                                        >
                                          <Checkbox
                                            checked={organizationIds.includes(org.id)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                if (!organizationIds.includes(org.id)) {
                                                  setOrganizationIds([...organizationIds, org.id]);
                                                }
                                              } else {
                                                setOrganizationIds(organizationIds.filter((id) => id !== org.id));
                                              }
                                            }}
                                          />
                                          <span className="ml-2">{org.name}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {organizationIds.map((id) => {
                                  const org = organisations.find((o) => o.id === id);
                                  return (
                                    <div key={id} className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center">
                                      {org?.name}
                                      <button
                                        type="button"
                                        className="ml-2 text-red-500"
                                        onClick={() =>
                                          setOrganizationIds(organizationIds.filter((orgId) => orgId !== id))
                                        }
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Champ Rôle enrichi avec Command */}
                            <div>
                              <Label className="mb-1 block">Rôle</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between">
                                    {role ? role : "Sélectionner ou saisir un rôle"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Rechercher ou ajouter un rôle"
                                      onValueChange={(value) => setRole(value)}
                                    />
                                    <CommandList>
                                      <CommandEmpty>Aucun rôle trouvé</CommandEmpty>

                                      <CommandGroup heading="Direction">
                                        {["Directeur Général", "Directeur Marketing", "Directeur Commercial", "Directeur de la Rédaction", "Directeur Technique (CTO)"].map((item) => (
                                          <CommandItem key={item} onSelect={() => setRole(item)}>
                                            {item}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>

                                      <CommandGroup heading="Publicité">
                                        {["Responsable Publicité", "Responsable Partenariats", "Media Planner", "Responsable Programmatique"].map((item) => (
                                          <CommandItem key={item} onSelect={() => setRole(item)}>
                                            {item}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>

                                      <CommandGroup heading="Marketing">
                                        {["Responsable Marketing", "Chef de Produit", "Responsable Communication", "Responsable Événementiel", "Responsable Branding"].map((item) => (
                                          <CommandItem key={item} onSelect={() => setRole(item)}>
                                            {item}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>

                                      <CommandGroup heading="Éditorial">
                                        {["Rédacteur en Chef", "Journaliste", "Community Manager", "Responsable SEO", "Responsable Contenu"].map((item) => (
                                          <CommandItem key={item} onSelect={() => setRole(item)}>
                                            {item}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>

                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label className="mb-1 block">Tags</Label>
                              <div className="flex flex-wrap gap-2 w-full">
                                {tags.split(',').filter(Boolean).map((tag, index) => (
                                  <div key={index} className="bg-muted px-2 py-1 rounded text-sm flex items-center">
                                    {tag.trim()}
                                    <button
                                      type="button"
                                      className="ml-1 text-red-500"
                                      onClick={() =>
                                        setTags(tags.split(',').filter((t, i) => i !== index).join(','))
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <Input
                                  className="h-9 text-sm"
                                  placeholder="Ajouter un tag"
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                      e.preventDefault();
                                      const trimmed = newTag.trim();
                                      if (!tags.split(',').map(t => t.trim()).includes(trimmed)) {
                                        setTags(tags ? `${tags},${trimmed}` : trimmed);
                                      }
                                      setNewTag("");
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 1. N° SIRET + bouton "Rechercher" */}
                            <div className="col-span-2 flex items-end gap-4">
                              <div className="flex-1">
                                <Label className="mb-1 block">N° SIRET</Label>
                                <div className="relative">
                                  <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input value={siret} onChange={(e) => setSiret(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                                </div>
                              </div>
                              <Button onClick={handleSiretLookup}>Rechercher</Button>
                            </div>
                            {/* 2. Nom de l'entreprise */}
                            <div>
                              <Label className="mb-1 block">Nom de l'entreprise</Label>
                              <div className="relative">
                                <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                              </div>
                            </div>
                            {/* 3. Forme juridique */}
                            <div>
                              <Label className="mb-1 block">Forme juridique</Label>
                              <Input value={formeJuridique} onChange={(e) => setFormeJuridique(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 4. SIREN */}
                            <div>
                              <Label className="mb-1 block">SIREN</Label>
                              <Input value={siren} onChange={(e) => setSiren(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 5. Code NAF */}
                            <div>
                              <Label className="mb-1 block">Code NAF</Label>
                              <Input value={codeNaf} onChange={(e) => setCodeNaf(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 6. Libellé Code NAF */}
                            <div>
                              <Label className="mb-1 block">Libellé Code NAF</Label>
                              <Input value={libelleCodeNaf} onChange={(e) => setLibelleCodeNaf(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 7. Date de création */}
                            <div>
                              <Label className="mb-1 block">Date de création</Label>
                              <Input type="date" value={dateCreation} onChange={(e) => setDateCreation(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 8. Chiffre d'affaires */}
                            <div>
                              <Label className="mb-1 block">Chiffre d'affaires</Label>
                              <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                            </div>
                            {/* 9. Email * */}
                            <div>
                              <Label className="mb-1 block">Email *</Label>
                              <div className="relative">
                                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-8 h-9 text-sm" />
                              </div>
                            </div>
                            {/* 10. Téléphone */}
                            <div>
                              <PhoneField value={phone} onChange={setPhone} className="w-full" />
                            </div>
                            {/* 11. Langue */}
                            <div>
                              <Label className="mb-1 block">Langue</Label>
                              <Select value={language} onValueChange={setLanguage}>
                                <div className="relative">
                                  <Languages className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <SelectTrigger className="w-full pl-8 h-9 text-sm">
                                    <SelectValue placeholder="Choisir une langue" />
                                  </SelectTrigger>
                                </div>
                                <SelectContent>
                                  <SelectItem value="french">Français</SelectItem>
                                  <SelectItem value="english">Anglais</SelectItem>
                                  <SelectItem value="spanish">Espagnol</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* 12. Tags */}
                            <div>
                              <Label className="mb-1 block">Tags</Label>
                              <div className="flex flex-wrap gap-2 w-full">
                                {tags.split(',').filter(Boolean).map((tag, index) => (
                                  <div key={index} className="bg-muted px-2 py-1 rounded text-sm flex items-center">
                                    {tag.trim()}
                                    <button
                                      type="button"
                                      className="ml-1 text-red-500"
                                      onClick={() =>
                                        setTags(tags.split(',').filter((t, i) => i !== index).join(','))
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <Input
                                  className="h-9 text-sm"
                                  placeholder="Ajouter un tag"
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                      e.preventDefault();
                                      const trimmed = newTag.trim();
                                      if (!tags.split(',').map(t => t.trim()).includes(trimmed)) {
                                        setTags(tags ? `${tags},${trimmed}` : trimmed);
                                      }
                                      setNewTag("");
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            {/* Secteur et sous-secteur combinés */}
                            <div className="col-span-2">
                              <Label className="mb-1 block">Secteur d'activité</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between">
                                    {sousSecteur
                                      ? secteurs.find(s => s.id === secteur)?.nom + " > " + sousSecteurs.find(ss => ss.id === sousSecteur)?.libelle
                                      : "Sélectionner un secteur et sous-secteur"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0 max-h-80 overflow-auto">
                                  <Command>
                                    <CommandInput placeholder="Rechercher..." />
                                    <CommandList>
                                      <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
                                      {secteurs.map((sect) => {
                                        const children = sousSecteurs.filter(ss => ss.secteur_id === sect.id);
                                        return children.length > 0 ? (
                                          <CommandGroup key={sect.id} heading={sect.nom}>
                                            {children.map((ss) => (
                                              <CommandItem
                                                key={ss.id}
                                                onSelect={() => {
                                                  setSecteur(sect.id);
                                                  setSousSecteur(ss.id);
                                                }}
                                              >
                                                {ss.libelle}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        ) : null;
                                      })}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </>
                        )}
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                        <AccordionItem value="address">
                          <AccordionTrigger>Adresse</AccordionTrigger>
                          <AccordionContent className="pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <Label className="mb-1 block">Adresse</Label>
                                <AddressAutocomplete
                                  onAddressSelected={({ label, postcode, city, region, country }) => {
                                    setAddress(label)
                                    setZipcode(postcode)
                                    setCity(city)
                                    setRegion(region)
                                    setCountry(country)
                                  }}
                                />
                              </div>
                              <div>
                                <Label className="mb-1 block">Code postal</Label>
                                <div className="relative">
                                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} className="pl-8 h-9 text-sm" />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-1 block">Ville</Label>
                                <div className="relative">
                                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input value={city} onChange={(e) => setCity(e.target.value)} className="pl-8 h-9 text-sm" />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-1 block">Région</Label>
                                <div className="relative">
                                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input value={region} onChange={(e) => setRegion(e.target.value)} className="pl-8 h-9 text-sm" />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-1 block">Pays</Label>
                                <div className="relative">
                                  <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input value={country} onChange={(e) => setCountry(e.target.value)} className="pl-8 h-9 text-sm" />
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="social">
                            <AccordionTrigger>Réseaux sociaux</AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                  <Label className="mb-1 block">Site Web</Label>
                                  <div className="relative">
                                    <Languages className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                                  </div>
                                </div>
                                <div className="col-span-1 flex flex-col justify-end">
                                  <Label className="mb-1 block">Logo</Label>
                                  <div className="max-w-[150px] rounded border p-2">
                                    <CompanyLogo domain={extractDomain(website)} />
                                  </div>
                                </div>
                                <div>
                                  <Label className="mb-1 block">LinkedIn</Label>
                                  <div className="relative">
                                    <Languages className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                                  </div>
                                </div>
                                <div>
                                  <Label className="mb-1 block">Instagram</Label>
                                  <div className="relative">
                                    <Languages className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full pl-8 h-9 text-sm" />
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="additional">
                            <AccordionTrigger>Informations complémentaires</AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-1 block">Périodicité</Label>
                                  <Select value={periodicity} onValueChange={setPeriodicity}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Choisir une périodicité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="quotidien">Quotidien</SelectItem>
                                      <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                                      <SelectItem value="mensuel">Mensuel</SelectItem>
                                      <SelectItem value="pqr">PQR</SelectItem>
                                      <SelectItem value="pqn">PQN</SelectItem>
                                      <SelectItem value="phr">PHR</SelectItem>
                                      <SelectItem value="multiples">Multiples</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="mb-1 block">Type de média</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between">
                                        {mediaType.length > 0 ? mediaType.join(', ') : "Choisir un ou plusieurs types de média"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Rechercher un type de média" />
                                        <CommandList>
                                          {["print", "radio", "tv", "web", "instagram", "facebook", "linkedin", "blog", "hors_media"].map((option) => (
                                            <CommandItem key={option} onSelect={() => {
                                              if (mediaType.includes(option)) {
                                                setMediaType(mediaType.filter(m => m !== option));
                                              } else {
                                                setMediaType([...mediaType, option]);
                                              }
                                            }}>
                                              <Checkbox
                                                checked={mediaType.includes(option)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    setMediaType([...mediaType, option]);
                                                  } else {
                                                    setMediaType(mediaType.filter(m => m !== option));
                                                  }
                                                }}
                                              />
                                              <span className="ml-2 capitalize">{option}</span>
                                            </CommandItem>
                                          ))}
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                {/* Champ Civilité supprimé */}
                             
                                <div>
                                  <Label className="mb-1 block">Éditeur</Label>
                                  <Input value={editeur} onChange={(e) => setEditeur(e.target.value)} className="max-w-sm w-full" />
                                </div>
                                <div>
                                  <Label className="mb-1 block">Support</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-between">
                                        {support.length > 0 ? support.join(', ') : "Choisir un ou plusieurs supports"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Rechercher un support" />
                                        <CommandList>
                                          {supportsList.map(({ value, label }) => (
                                            <CommandItem key={value} onSelect={() => {
                                              if (support.includes(value)) {
                                                setSupport(support.filter(s => s !== value));
                                              } else {
                                                setSupport([...support, value]);
                                              }
                                            }}>
                                              <Checkbox
                                                checked={support.includes(value)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    setSupport([...support, value]);
                                                  } else {
                                                    setSupport(support.filter(s => s !== value));
                                                  }
                                                }}
                                              />
                                              <span className="ml-2">{label}</span>
                                            </CommandItem>
                                          ))}
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="border-t p-6 sticky bottom-0 bg-white flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Fermer
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFirstName("")
                                setLastName("")
                                setTitle("")
                                setEmail("")
                                setPhone("")
                                setGender("unspecified")
                                setLanguage("")
                                setOrganizationIds([])
                                setTags("")
                                setCompanyName("")
                                setSiret("")
                                setAddress("")
                                setZipcode("")
                                setCity("")
                                setRegion("")
                                setCountry("")
                                setWebsite("")
                                setLinkedin("")
                                setInstagram("")
                                setPeriodicity("")
                                setMediaType([])
                                setSecteur("")
                                setSousSecteur("")
                                setEditeur("")
                                setSupport([])
                            }}
                            disabled={loading}
                        >
                            Réinitialiser
                        </Button>
                        <Button className="bg-primary text-white" onClick={handleSaveContact} disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer le contact"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
