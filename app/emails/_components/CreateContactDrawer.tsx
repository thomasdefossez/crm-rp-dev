"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, FC } from "react"
import clsx from "clsx"
import AddressAutocomplete from "./AddressAutocomplete"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onContactCreated?: () => void
}

export const CreateContactDrawer: FC<Props> = ({ open, onOpenChange, onContactCreated }) => {
    const [loading, setLoading] = useState(false)
    const [contactType, setContactType] = useState<"person" | "organization">("person")

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [title, setTitle] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [gender, setGender] = useState("unspecified")
    const [language, setLanguage] = useState("")
    const [organization, setOrganization] = useState("")
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
    const [mediaType, setMediaType] = useState("")
    const [salutation, setSalutation] = useState("")
    const [role, setRole] = useState("")
    const [editeur, setEditeur] = useState("")
    const [support, setSupport] = useState("")

    async function handleSiretLookup() {
        if (!siret.trim()) return
        try {
            const res = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`)
            const json = await res.json()
            if (json.etablissement) {
                setCompanyName(json.etablissement.entreprise.denomination_usuelle_1 || "")
                setAddress(json.etablissement.adresse_ligne_1 || "")
                setZipcode(json.etablissement.code_postal || "")
                setCity(json.etablissement.libelle_commune || "")
                setCountry("France")
                toast.success("Informations récupérées via le SIRET")
            } else {
                toast.error("SIRET non trouvé")
            }
        } catch (err) {
            toast.error("Erreur lors de la récupération du SIRET")
        }
    }

    async function handleSaveContact() {
        if (!email.trim()) {
            toast.error("Une adresse email est requise.")
            return
        }
        setLoading(true)
        const { error } = await supabase.from("contacts").insert([
            {
                contact_type: contactType,
                firstname: firstName,
                lastname: lastName,
                title,
                email,
                phone,
                gender,
                salutation,
                company_name: companyName,
                language,
                organisation_id: null,
                address,
                zipcode,
                city,
                region,
                country,
                website,
                linkedin,
                instagram,
                periodicity,
                media_type: mediaType,
                tags,
                role,
                editeur,
                support,
            },
        ])
        setLoading(false)
        if (error) {
            toast.error(`Erreur : ${error.message}`)
        } else {
            toast.success("Contact ajouté avec succès")
            onOpenChange(false)
            onContactCreated?.()
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="p-0 w-[900px] max-w-[800px] flex flex-col">
                <div className="p-6 pb-2 border-b">
                    <SheetHeader>
                        <SheetTitle className="text-lg">Créer un contact</SheetTitle>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-scroll p-6 space-y-8">
                    <div className="flex gap-4">
                        <Button variant={contactType === "person" ? "default" : "outline"} onClick={() => setContactType("person")}>Personne</Button>
                        <Button variant={contactType === "organization" ? "default" : "outline"} onClick={() => setContactType("organization")}>Organisation</Button>
                    </div>

                    <div className="space-y-4">
                        {contactType === "person" ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Prénom</Label>
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Nom</Label>
                                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>N° SIRET</Label>
                                <div className="flex gap-2">
                                    <Input value={siret} onChange={(e) => setSiret(e.target.value)} />
                                    <Button onClick={handleSiretLookup}>Rechercher</Button>
                                </div>
                                <Label>Nom de l'entreprise</Label>
                                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                        )}

                        <Label>Email *</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                        <Label>Téléphone</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

                        {contactType === "person" && (
                            <div>
                                <Label>Genre</Label>
                                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                                    <RadioGroupItem value="male" id="male" /> <Label htmlFor="male">Homme</Label>
                                    <RadioGroupItem value="female" id="female" /> <Label htmlFor="female">Femme</Label>
                                    <RadioGroupItem value="unspecified" id="unspecified" /> <Label htmlFor="unspecified">Non spécifié</Label>
                                </RadioGroup>
                            </div>
                        )}

                        <Label>Langue</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger><SelectValue placeholder="Choisir une langue" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="french">Français</SelectItem>
                                <SelectItem value="english">Anglais</SelectItem>
                                <SelectItem value="spanish">Espagnol</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label>Organisation</Label>
                        <Input value={organization} onChange={(e) => setOrganization(e.target.value)} />

                        <Label>Tags</Label>
                        <Input value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>

                    <Accordion type="multiple" className="space-y-4">
                        <AccordionItem value="address">
                            <AccordionTrigger>Adresse</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <Label>Adresse</Label>
                                <AddressAutocomplete
                                    onAddressSelected={({ label, postcode, city, region, country }) => {
                                        setAddress(label)
                                        setZipcode(postcode)
                                        setCity(city)
                                        setRegion(region)
                                        setCountry(country)
                                    }}
                                />
                                <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="Code postal" />
                                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" />
                                <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Région" />
                                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pays" />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="social">
                            <AccordionTrigger>Réseaux sociaux</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <Label>Site Web</Label>
                                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                                <Label>LinkedIn</Label>
                                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                                <Label>Instagram</Label>
                                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="additional">
                            <AccordionTrigger>Informations complémentaires</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <Label>Périodicité</Label>
                                <Input value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} />
                                <Label>Type de média</Label>
                                <Input value={mediaType} onChange={(e) => setMediaType(e.target.value)} />
                                <Label>Civilité</Label>
                                <Input value={salutation} onChange={(e) => setSalutation(e.target.value)} />
                                <Label>Rôle</Label>
                                <Input value={role} onChange={(e) => setRole(e.target.value)} />
                                <Label>Éditeur</Label>
                                <Input value={editeur} onChange={(e) => setEditeur(e.target.value)} />
                                <Label>Support</Label>
                                <Input value={support} onChange={(e) => setSupport(e.target.value)} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="border-t p-6 sticky bottom-0 bg-white flex justify-between">
                    <Button variant="secondary">Enregistrer et créer un autre</Button>
                    <Button className="bg-primary text-white" onClick={handleSaveContact} disabled={loading}>
                        {loading ? "Enregistrement..." : "Enregistrer le contact"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
