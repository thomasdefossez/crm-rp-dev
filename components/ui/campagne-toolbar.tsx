"use client"
"use client"

import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button"
import { CalendarIcon, SettingsIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CreateCampaignDialog } from "@/components/emails/CreateCampaignDialog"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toast } from "sonner"

export function CampagneToolbar({
    onCampaignCreated,
    selectedCampaignId,
    onDeleted
}: {
    onCampaignCreated?: (id: string) => void,
    selectedCampaignId?: string,
    onDeleted?: () => void
}) {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [openCreate, setOpenCreate] = useState(false)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    const deleteCampaign = async (id: string) => {
        const { error } = await supabase
            .from("campaigns")
            .delete()
            .eq("id", id)

        if (error) {
            toast(
                <div>
                    <p className="font-bold text-red-500">Erreur lors de la suppression</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                </div>
            )
        } else {
            toast(
                <div>
                    <p className="font-bold">Campagne supprimée</p>
                    <p className="text-sm text-muted-foreground">La campagne {id} a été supprimée.</p>
                </div>
            )
            if (onDeleted) {
                onDeleted()
            }
        }
    }

    const handleDeleteClick = () => {
        if (!selectedCampaignId) {
            toast(
                <div>
                    <p className="font-bold text-red-500">Aucune campagne sélectionnée</p>
                    <p className="text-sm text-muted-foreground">Veuillez sélectionner une campagne à supprimer.</p>
                </div>
            )
            return
        }
        setConfirmDeleteOpen(true)
    }

    const confirmDelete = () => {
        if (selectedCampaignId) {
            deleteCampaign(selectedCampaignId)
        }
        setConfirmDeleteOpen(false)
    }

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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className="border border-input p-2 rounded-full"
                            onClick={() => setOpenCreate(true)}
                        >
                            <PlusIcon className="w-4 h-4 text-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nouveau</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" className="border border-input p-2 rounded-full">
                            <SettingsIcon className="w-4 h-4 text-foreground" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paramètres</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" onClick={handleDeleteClick} className="border border-red-500 p-2 rounded-full">
                            <Trash2Icon className="w-4 h-4 text-red-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Supprimer</TooltipContent>
                </Tooltip>
            </div>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-md">
                    <CreateCampaignDialog
                        onClose={() => setOpenCreate(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <div className="space-y-4">
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <p>Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
                            <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
