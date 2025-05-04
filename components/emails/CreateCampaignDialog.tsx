'use client';

import { useState } from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CreateCampaignDialogProps {
    onClose?: () => void;
}

export function CreateCampaignDialog({ onClose }: CreateCampaignDialogProps) {
    const [campaignName, setCampaignName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!campaignName.trim()) {
            toast.warning('Le nom de la campagne est requis');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('campaigns')
            .insert({ name: campaignName })
            .select()
            .single();

        setLoading(false);

        if (error || !data) {
            toast.error('Erreur lors de la création de la campagne');
            return;
        }

        toast.success('Campagne créée avec succès');
        onClose?.();
        router.push(`/emails/campagne/addcampagne?id=${data.id}`);
    };

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Créer une campagne</DialogTitle>
            </DialogHeader>

            <Input
                placeholder="Nom de la campagne"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>
                    Annuler
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                    Créer et continuer
                </Button>
            </div>
        </div>
    );
}