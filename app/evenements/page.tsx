"use client"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function PresseLunchPage() {
    const mockParticipants = [
      [
        { name: "Clara Dupont", media: "Le Monde", avatar: "https://i.pravatar.cc/150?img=1", response: 75 },
        { name: "Jules Martin", media: "Libération", avatar: "https://i.pravatar.cc/150?img=2", response: 33 },
        { name: "Marie Robert", media: "Les Ectics", avatar: "https://i.pravatar.cc/150?img=3", response: 50 },
        { name: "Antoine Lefèvre", media: "France Info", avatar: "https://i.pravatar.cc/150?img=4", response: 0 },
      ],
      [
        { name: "Sophie Bernard", media: "Elie", avatar: "https://i.pravatar.cc/150?img=5", response: 100 },
        { name: "Lucas Moreau", media: "Le Figaro", avatar: "https://i.pravatar.cc/150?img=6", response: 67 },
        { name: "Emma Caron", media: "BFMTV", avatar: "https://i.pravatar.cc/150?img=7", response: 20 },
        { name: "Léa Morin", media: "AFP", avatar: "https://i.pravatar.cc/150?img=8", response: 0 },
      ],
      [
        { name: "Philippe Laurent", media: "Le Parisien", avatar: "https://i.pravatar.cc/150?img=9", response: 60 },
        { name: "Alice Simon", media: "L'Express", avatar: "https://i.pravatar.cc/150?img=10", response: 29 },
        { name: "Mathieu Garcia", media: "Challenges", avatar: "https://i.pravatar.cc/150?img=11", response: 83 },
        { name: "Thomas Chevalier", media: "La Croix", avatar: "https://i.pravatar.cc/150?img=12", response: 0 },
      ],
      [
        { name: "Clara Dupont", media: "Le Monde", avatar: "https://i.pravatar.cc/150?img=1", response: 75 },
        { name: "Jules Martin", media: "Libération", avatar: "https://i.pravatar.cc/150?img=2", response: 33 },
        { name: "Marie Robert", media: "Les Ectics", avatar: "https://i.pravatar.cc/150?img=3", response: 50 },
        { name: "Antoine Lefèvre", media: "France Info", avatar: "https://i.pravatar.cc/150?img=4", response: 0 },
      ],
      [
        { name: "Sophie Bernard", media: "Elie", avatar: "https://i.pravatar.cc/150?img=5", response: 100 },
        { name: "Lucas Moreau", media: "Le Figaro", avatar: "https://i.pravatar.cc/150?img=6", response: 67 },
        { name: "Emma Caron", media: "BFMTV", avatar: "https://i.pravatar.cc/150?img=7", response: 20 },
        { name: "Léa Morin", media: "AFP", avatar: "https://i.pravatar.cc/150?img=8", response: 0 },
      ],
      [
        { name: "Philippe Laurent", media: "Le Parisien", avatar: "https://i.pravatar.cc/150?img=9", response: 60 },
        { name: "Alice Simon", media: "L'Express", avatar: "https://i.pravatar.cc/150?img=10", response: 29 },
        { name: "Mathieu Garcia", media: "Challenges", avatar: "https://i.pravatar.cc/150?img=11", response: 83 },
        { name: "Thomas Chevalier", media: "La Croix", avatar: "https://i.pravatar.cc/150?img=12", response: 0 },
      ]
    ];

    const eventTitles = ["Product Launch", "New Collection", "Sustainability Summit", "Déjeuner Presse Médias", "Présentation Nouveautés", "Rencontre Grands Reporters"];
    const eventDates = ["4 May", "15 May", "23 May", "30 May", "2 June", "10 June"];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="p-6 flex flex-col gap-6">
                    {/* Fil d'Ariane */}
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                          <BreadcrumbPage>Déjeuners presse</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>

                    
                    {/* Filtres */}
                    <div className="flex flex-wrap gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Tous les événements</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Lancement de produit</DropdownMenuItem>
                                <DropdownMenuItem>Nouvelle collection</DropdownMenuItem>
                                <DropdownMenuItem>Sommet sur la durabilité</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Input placeholder="Rechercher un invité…" className="w-64" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Taux de réponse</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Le plus élevé</DropdownMenuItem>
                                <DropdownMenuItem>Le plus faible</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Colonnes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventTitles.map((eventTitle, index) => {
                            const safeParticipants = mockParticipants[index] ?? []
                            const safeDate = eventDates[index] ?? "À définir"
                            return (
                            <div key={eventTitle} className="bg-white p-4 rounded-xl shadow-md">
                                <h2 className="text-sm font-semibold text-foreground">
                                  <Link href={`/evenements/${index}`} className="hover:underline">
                                    {eventTitle}
                                  </Link>
                                </h2>
                                <p className="text-xs text-purple-700 mt-1">
                                  <Link href={`/evenements/${index}`} className="hover:underline underline-offset-2">
                                    Voir détail →
                                  </Link>
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">{safeDate}</p>

                                {safeParticipants.map((participant, i) => (
                                  <div key={i} className="bg-muted rounded-lg p-3 mb-3 flex items-center gap-3 shadow-sm">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={participant.avatar} />
                                      <AvatarFallback>{participant.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium leading-none text-foreground">{participant.name}</p>
                                      <p className="text-xs text-muted-foreground">{participant.media}</p>
                                      <div className="mt-1">
                                        <Progress value={participant.response} className="h-2 bg-purple-100 [&>div]:bg-purple-500" />
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium text-primary">
                                      {participant.response}%
                                    </p>
                                  </div>
                                ))}
                            </div>
                            )
                        })}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}