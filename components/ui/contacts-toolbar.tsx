"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon, SettingsIcon, PlusIcon } from "lucide-react"
import { useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

type ContactsToolbarProps = {
  onAddContact: () => void
}

export function ContactsToolbar({
  onAddContact,
}: ContactsToolbarProps) {
    const dialogTriggerRef = useRef<HTMLButtonElement>(null)
    const router = useRouter()

    async function handleCreateList(listName: string) {
      // Implémenter la logique de création de la liste ici
      console.log("Création de la liste :", listName)
    }

    return (
        <>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onAddContact} className="bg-violet-700 text-white hover:bg-violet-800">
                    <PlusIcon className="w-4 h-4 mr-2" /> Ajouter un contact
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/settings/import')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Importer
                </Button>
            </div>
        </div>
        </>
    )
}
