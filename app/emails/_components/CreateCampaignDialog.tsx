"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CreateCampaignDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCampaignCreated?: (id: string) => void
}

export default function CreateCampaignDialog({
                                                 open,
                                                 onOpenChange,
                                                 onCampaignCreated,
                                             }: CreateCampaignDialogProps) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return

        setLoading(true)
        const res = await fetch("/api/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })

        const result = await res.json()

        if (!res.ok) {
            toast.error(result.error || "Erreur lors de la création")
        } else {
            toast.success("Campagne créée")
            setName("")
            onOpenChange(false)
            if (onCampaignCreated) {
                onCampaignCreated(result.data.id)
            } else {
                window.location.href = `/emails/add?id=${result.data.id}`
            }
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby="create-campaign-description">
                <DialogHeader>
                    <DialogTitle>Créer une nouvelle campagne</DialogTitle>
                </DialogHeader>
                <p id="create-campaign-description" className="sr-only">
                  Entrez le nom de votre campagne et cliquez sur "Créer et continuer".
                </p>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Nom de la campagne"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreate} disabled={loading || !name.trim()}>
                            Créer et continuer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}