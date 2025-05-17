"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon, SettingsIcon, PlusIcon } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { useState, useRef } from "react"
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
  onDateRangeChange: (range: { from: Date; to?: Date } | undefined) => void
  popoverProps?: {
    align?: "start" | "center" | "end"
    sideOffset?: number
    avoidCollisions?: boolean
    className?: string
  }
}

export function ContactsToolbar({
  onAddContact,
  onDateRangeChange,
  popoverProps,
}: ContactsToolbarProps) {
    const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>()
    const dialogTriggerRef = useRef<HTMLButtonElement>(null)
    const router = useRouter()

    async function handleCreateList(listName: string) {
      // Implémenter la logique de création de la liste ici
      console.log("Création de la liste :", listName)
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                <DatePickerWithRange date={dateRange} setDate={(range) => {
                  setDateRange(range)
                  onDateRangeChange(range)
                }} />
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onAddContact} className="bg-violet-700 text-white hover:bg-violet-800">
                    <PlusIcon className="w-4 h-4 mr-2" /> Ajouter un contact
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Paramètres
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log('Exporter les contacts')}>
                      Exporter les contacts
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button onClick={() => router.push('/settings/import')} className="w-full text-left">
                        Paramètres d’import
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Synchronisation')}>
                      Synchronisation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button ref={dialogTriggerRef} variant="outline" size="sm">Nouvelle liste</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-6 rounded-lg shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900">Créer une nouvelle liste</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la liste <span className="text-gray-500">(Obligatoire)</span></label>
                        <Input id="list-name" placeholder="Nom de la liste" className="mt-1" />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" className="border-gray-300 text-gray-700">Annuler</Button>
                        <Button className="bg-purple-600 text-white hover:bg-purple-700"
                                onClick={async () => {
                                  const input = document.querySelector<HTMLInputElement>('#list-name');
                                  if (!input || !input.value.trim()) return;
                                  const listName = input.value.trim();
                                  await handleCreateList(listName);
                                  input.value = '';
                                }}>
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
