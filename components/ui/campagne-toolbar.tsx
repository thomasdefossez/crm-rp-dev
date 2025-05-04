"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon, SettingsIcon, PlusIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreateCampaignDialog } from "@/components/emails/CreateCampaignDialog"

export function CampagneToolbar() {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [openCreate, setOpenCreate] = useState(false)

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {date ? format(date, "PPP") : "Sélectionner une date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={() => setOpenCreate(true)} className="bg-violet-700 text-white hover:bg-violet-800">
                    <PlusIcon className="w-4 h-4 mr-2" /> Ajouter une campagne
                </Button>
                <Button variant="outline">
                    <SettingsIcon className="w-4 h-4" />
                </Button>
            </div>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-md">
                    <CreateCampaignDialog onClose={() => setOpenCreate(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
