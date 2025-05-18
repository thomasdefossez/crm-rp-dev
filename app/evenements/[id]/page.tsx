'use client'

import { useParams } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface Guest {
  name: string;
  media: string;
  avatar: string;
  participations: number;
  presenceRate: number;
}

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const mockEvent = {
    name: 'IA & Médias',
    restaurant: 'Café de la Paix',
    address: '5 Place de l\'Opéra, 75009 Paris',
    date: '15 mai 2025',
    time: '12:00 – 13:30',
    organisation_id: null,
    client: 'Le Monde',
    price: '48 € / pers.',
}

const columns: Record<string, Guest[]> = {
    'À inviter': [],
    'Invité': [],
    'A confirmé': [],
    'A refusé': [],
    'Pas de réponse': [],
}

columns['À inviter'].push({
    name: 'Clara Dupont',
    media: 'Le Monde',
    avatar: 'https://i.pravatar.cc/150?img=1',
    participations: 0,
    presenceRate: 5,
})
columns['Invité'].push({
    name: 'Jules Martin',
    media: 'Libération',
    avatar: 'https://i.pravatar.cc/150?img=2',
    participations: 10,
    presenceRate: 50,
})
columns['A confirmé'].push({
    name: 'Emma Robert',
    media: 'BFMTV',
    avatar: 'https://i.pravatar.cc/150?img=3',
    participations: 20,
    presenceRate: 95,
})

function KanbanCard({ guest, id }: { guest: Guest; id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    animateLayoutChanges: () => true,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms ease',
  }

  // Remplacement temporaire de Card par div pour tester le drag & drop sans blocage typé
  return (
    <div
      ref={setNodeRef}
      id={id}
      draggable
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-muted p-3 flex flex-col gap-2 cursor-move rounded-md border border-gray-200 bg-white 
        ${transform ? 'shadow-xl' : 'shadow-sm'} transition-shadow
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={guest.avatar} />
          <AvatarFallback className="bg-purple-600 text-white">{guest.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{guest.name}</p>
          <p className="text-sm text-muted-foreground">{guest.media}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex justify-between items-center">
        <span>{guest.participations} participations</span>
        <p className="text-sm text-primary font-semibold">{guest.presenceRate}%</p>
      </div>
    </div>
  )
}

function KanbanColumn({
  columnName,
  guests,
}: {
  columnName: string
  guests: Guest[]
}) {
  const { setNodeRef } = useDroppable({ id: columnName })

  return (
    <div ref={setNodeRef} data-id={columnName}>
      <h3 className="text-sm font-semibold text-purple-700 mb-2">{columnName}</h3>
      <SortableContext
        items={guests.map((g) => `${g.name}-${columnName}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {guests.map((guest) => (
            <KanbanCard key={`${guest.name}-${columnName}`} guest={guest} id={`${guest.name}-${columnName}`} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function EventDetailPage() {
    const { id } = useParams()

    const [kanbanColumns, setKanbanColumns] = useState(columns)

    const [search, setSearch] = useState("")
    const [contacts, setContacts] = useState<any[]>([])

    const [dialogOpen, setDialogOpen] = useState(false)

    const [clientSearch, setClientSearch] = useState("")
    const [clientOptions, setClientOptions] = useState<any[]>([])
    const [clientDialogOpen, setClientDialogOpen] = useState(false)
    const [clientLabel, setClientLabel] = useState(mockEvent.client)

    useEffect(() => {
      const fetchContacts = async () => {
        const { data, error } = await supabase
          .from("contacts")
          .select("id, firstname, lastname, email")
          .or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%`)

        if (!error) setContacts(data || [])
      }
      if (search.length > 1) fetchContacts()
    }, [search])

    useEffect(() => {
      const fetchClients = async () => {
        const { data, error } = await supabase
          .from("organisations")
          .select("id, name")
          .ilike("name", `%${clientSearch}%`)
        if (!error) setClientOptions(data || [])
      }
      if (clientSearch.length > 1) fetchClients()
    }, [clientSearch])

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
    )

    const handleDragEnd = (event: any) => {
      const { active, over } = event
      console.log("🧪 DRAG END →", {
        activeId: active?.id,
        overId: over?.id,
      })
      if (!over || active.id === over.id) return

      const activeId = active.id
      const overId = over.id

      const extractName = (id: string) => id.split('-')[0]

      let sourceColumnName = ""
      let targetColumnName = ""

      for (const [columnName, guests] of Object.entries(kanbanColumns)) {
        if (guests.find((g) => `${g.name}-${columnName}` === activeId)) {
          sourceColumnName = columnName
        }
        if (guests.find((g) => `${g.name}-${columnName}` === overId)) {
          targetColumnName = columnName
        }
      }

      // Si over.id est une colonne et pas une carte
      if (!targetColumnName && kanbanColumns[overId]) {
        targetColumnName = overId
      }

      if (!sourceColumnName || !targetColumnName || sourceColumnName === targetColumnName) return

      const guest = kanbanColumns[sourceColumnName].find((g) => `${g.name}-${sourceColumnName}` === activeId)
      if (!guest) return

      const updatedSource = kanbanColumns[sourceColumnName].filter((g) => `${g.name}-${sourceColumnName}` !== activeId)
      const updatedTarget = [guest, ...kanbanColumns[targetColumnName]]

      if (targetColumnName === "A confirmé") {
        toast.success(`🎉 ${guest.name} a confirmé sa présence !`, {
          description: "On va pouvoir commander les petits fours 🍰",
          duration: 3000,
        })
      }

      if (targetColumnName === "A refusé") {
        toast.error(`😢 ${guest.name} a décliné l'invitation.`, {
          description: "Dommage, on lui racontera !",
          duration: 3000,
        })
      }

      if (targetColumnName === "Invité") {
        toast(`📩 ${guest.name} a été invité !`, {
          description: "On croise les doigts pour qu’il réponde 🤞",
          duration: 3000,
        })
      }

      setKanbanColumns({
        ...kanbanColumns,
        [sourceColumnName]: updatedSource,
        [targetColumnName]: updatedTarget,
      })
    }

    const allItems = Object.entries(kanbanColumns).flatMap(([columnName, guests]) =>
      guests.map((g) => `${g.name}-${columnName}`)
    )

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-6 space-y-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/evenements">Déjeuners presse</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Détail</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{mockEvent.name}</h1>
                <p className="text-sm text-muted-foreground">{mockEvent.date} • {mockEvent.time}</p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-purple-700">
                Événement VIP
              </div>
                <div className="text-sm text-muted-foreground"><strong>Restaurant :</strong> {mockEvent.restaurant}</div>
                <div className="text-sm text-muted-foreground"><strong>Adresse :</strong> {mockEvent.address}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span><strong>Client :</strong> {clientLabel}</span>
                  <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs ml-2">Associer un client</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rechercher un client</DialogTitle>
                      </DialogHeader>
                      <Input
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Nom du client"
                        className="mb-3"
                      />
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {clientOptions.map((org) => (
                          <div
                            key={org.id}
                            className="flex justify-between items-center border rounded-md p-2 text-sm"
                          >
                            <span>{org.name}</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => {
                                mockEvent.organisation_id = org.id
                                setClientLabel(org.name)
                                setClientDialogOpen(false)
                                toast.success(`Client associé : ${org.name}`)
                              }}
                            >
                              Associer
                            </Button>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-col-reverse md:flex-row justify-between gap-6 mt-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm text-muted-foreground"><strong>Note Google :</strong> ⭐️⭐️⭐️⭐️☆ (4.2)</p>
                    <p className="text-sm text-muted-foreground"><strong>Type :</strong> Brasserie chic</p>
                    <p className="text-sm text-muted-foreground"><strong>Horaires :</strong> 11h30 - 22h30</p>
                    <p className="text-sm text-muted-foreground"><strong>Téléphone :</strong> 01 42 33 44 55</p>
                    <p className="text-sm text-muted-foreground"><strong>Email :</strong> contact@cafedelapaix.fr</p>
                    <p className="text-sm text-muted-foreground"><strong>Prix :</strong> {mockEvent.price}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        📍 Changer d’emplacement
                      </Button>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="text-xs bg-purple-600 text-white hover:bg-purple-700">
                            ➕ Inviter une personne
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rechercher un contact</DialogTitle>
                          </DialogHeader>
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nom du contact..."
                            className="mb-4"
                          />
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {contacts.map((c) => (
                              <div
                                key={c.id}
                                className="rounded-lg border p-3 flex items-center justify-between bg-background shadow-sm"
                              >
                                <div className="flex flex-col text-sm">
                                  <span className="font-medium text-foreground">
                                    {c.firstname} {c.lastname}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{c.email}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs"
                                  onClick={() => {
                                    const newGuest = {
                                      name: `${c.firstname} ${c.lastname}`,
                                      media: "—",
                                      avatar: "https://i.pravatar.cc/150?u=" + c.email,
                                      participations: 0,
                                      presenceRate: 0,
                                    }

                                    setKanbanColumns((prev) => ({
                                      ...prev,
                                      "À inviter": [...prev["À inviter"], newGuest],
                                    }))

                                    toast.success(`${c.firstname} ajouté dans "À inviter"`)
                                    setDialogOpen(false)
                                  }}
                                >
                                  Ajouter
                                </Button>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="w-full md:w-[250px] rounded-md overflow-hidden ring-1 ring-muted">
                    <iframe
                      title="Carte OpenStreetMap"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=2.3300,48.8690,2.3360,48.8720&layer=mapnik&marker=48.8708,2.3335"
                      className="w-full h-32 border-none"
                      loading="lazy"
                    />
                  </div>
                </div>
            </div>

            <Separator />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(kanbanColumns).map(([columnName, guests]) => (
                  <KanbanColumn key={columnName} columnName={columnName} guests={guests} />
                ))}
              </div>
            </DndContext>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
}