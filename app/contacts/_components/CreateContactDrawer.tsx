"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
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
import { Plus } from "lucide-react"
import clsx from "clsx"
import AddressAutocomplete from "./AddressAutocomplete"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type Props = {
    onContactCreated?: () => void
}

export const CreateContactDrawer: FC<Props> = ({ onContactCreated }) => {
    const [open, setOpen] = useState(false)
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

    async function handleSaveContact() {
        if (!email.trim()) {
            toast.error("Une adresse email est requise.")
            return
        }

        setLoading(true)

        const { data, error } = await supabase.from("contacts").insert([
            {
                contact_type: contactType || null,
                firstname: firstName || null,
                lastname: lastName || null,
                title: title || null,
                email: email.trim(),
                phone: phone || null,
                gender: gender || null,
                salutation: salutation || null,
                name: companyName || null,
                language: language || null,
                organisation_id: null,
                address: address || null,
                zipcode: zipcode || null,
                city: city || null,
                region: region || null,
                country: country || null,
                website: website || null,
                linkedin: linkedin || null,
                instagram: instagram || null,
                periodicity: periodicity || null,
                media_type: mediaType || null,
                tags: tags || null,
            },
        ])

        setLoading(false)

        if (error) {
            console.error("❌ Erreur Supabase :", error.message)
            toast.error(`Erreur Supabase : ${error.message}`)
        } else {
            toast.success("Contact enregistré avec succès !")
            setOpen(false)
            onContactCreated?.()
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un contact
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                style={{ width: "700px", maxWidth: "700px" }}
                className="p-0 flex flex-col"
            >
                <div className="p-6 pb-2 border-b">
                    <SheetHeader>
                        <SheetTitle className="text-lg">Créer un contact</SheetTitle>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-scroll p-6 space-y-8">
                    {/* Type de contact */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setContactType("person")}
                            className={clsx(
                                "w-1/2 rounded-md border px-4 py-2 text-sm font-medium transition",
                                contactType === "person"
                                    ? "bg-green-50 border-green-300 text-green-900"
                                    : "bg-white border-muted text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Personne
                        </button>
                        <button
                            type="button"
                            onClick={() => setContactType("organization")}
                            className={clsx(
                                "w-1/2 rounded-md border px-4 py-2 text-sm font-medium transition",
                                contactType === "organization"
                                    ? "bg-green-50 border-green-300 text-green-900"
                                    : "bg-white border-muted text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Organisation
                        </button>
                    </div>

                    {/* Champs principaux */}
                    <div className="space-y-4">
                        {contactType === "person" ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block mb-2">Prénom</Label>
                                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="block mb-2">Nom</Label>
                                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label className="block mb-2">Fonction ou titre</Label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                            </>
                        ) : (
                            <div>
                                <Label className="block mb-2">Nom de l'entreprise</Label>
                                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                        )}

                        <div>
                            <Label className="block mb-2">Adresse e-mail *</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label className="block mb-2">Numéro de téléphone</Label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        {contactType === "person" && (
                            <div>
                                <Label className="block mb-2">Genre</Label>
                                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" id="male" />
                                        <Label htmlFor="male">Homme</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" id="female" />
                                        <Label htmlFor="female">Femme</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="unspecified" id="unspecified" />
                                        <Label htmlFor="unspecified">Non spécifié</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}

                        <div>
                            <Label className="block mb-2">Langues</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Rechercher une langue" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="french">Français</SelectItem>
                                    <SelectItem value="english">Anglais</SelectItem>
                                    <SelectItem value="spanish">Espagnol</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block mb-2">Organisation</Label>
                            <Input value={organization} onChange={(e) => setOrganization(e.target.value)} />
                        </div>

                        <div>
                            <Label className="block mb-2">Tags</Label>
                            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
                        </div>
                    </div>

                    {/* Accordéons */}
                    <Accordion type="multiple" className="space-y-4">
                        <AccordionItem value="address">
                            <AccordionTrigger>Informations d'adresse</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Label className="block mb-2">Adresse</Label>
                                <AddressAutocomplete
                                    onAddressSelected={({ label, postcode, city, region, country }) => {
                                        setAddress(label)
                                        setZipcode(postcode)
                                        setCity(city)
                                        setRegion(region)
                                        setCountry(country)
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="block mb-2">Code postal</Label>
                                        <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="block mb-2">Ville</Label>
                                        <Input value={city} onChange={(e) => setCity(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="block mb-2">Région</Label>
                                        <Input value={region} onChange={(e) => setRegion(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="block mb-2">Pays</Label>
                                        <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="social">
                            <AccordionTrigger>Réseaux sociaux</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Label className="block mb-2">Site web</Label>
                                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                                <Label className="block mb-2">LinkedIn</Label>
                                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                                <Label className="block mb-2">Instagram</Label>
                                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="additional">
                            <AccordionTrigger>Informations complémentaires</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Label className="block mb-2">Périodicité</Label>
                                <Input value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} />
                                <Label className="block mb-2">Type de média</Label>
                                <Input value={mediaType} onChange={(e) => setMediaType(e.target.value)} />
                                <Label className="block mb-2">Civilité</Label>
                                <Input value={salutation} onChange={(e) => setSalutation(e.target.value)} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Footer */}
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