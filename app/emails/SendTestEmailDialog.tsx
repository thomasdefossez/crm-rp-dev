'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react'; // 👈 Ajout icône Mail
import { useState } from 'react';
import { toast } from 'sonner'; // Toaster
import { useSession } from '@supabase/auth-helpers-react'; // Supabase Auth

interface SendTestEmailDialogProps {
    trigger: React.ReactNode;
    emailBody: string;
}

export default function SendTestEmailDialog({
                                                trigger,
                                                emailBody,
                                            }: SendTestEmailDialogProps) {
    const [open, setOpen] = useState(false);
    const session = useSession();
    const userEmail = session?.user?.email || 'success@resend.dev'; // Utilisateur connecté ou fallback Resend

    const [subject, setSubject] = useState('');

    const handleSendTestEmail = async () => {
        const htmlContent = emailBody ? emailBody.replace(/\n/g, '<br>') : '<p>Aucun contenu</p>';

        try {
            const response = await fetch('/api/send-test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: subject || 'Test Email',
                    html: htmlContent,
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Réponse non-JSON du serveur: ${text}`);
            }

            const result = await response.json();
            if (result.success) {
                toast.success('Email envoyé avec succès !');
                setOpen(false); // Fermer la popin après succès
            } else {
                toast.error('Erreur lors de l’envoi : ' + result.error.message);
            }
        } catch (error: any) {
            toast.error('Erreur lors de l’envoi : ' + error.message);
        }
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>{trigger}</div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Envoyer un email test</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600 mb-4">
                        L'envoi du test <strong>n'affichera pas</strong> votre nom ni votre adresse email comme expéditeur.
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Nom de l'expéditeur</div>
                            <div className="text-sm font-medium text-gray-900">Prowly (onboarding@resend.dev)</div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Objet</div>
                            <Input
                                placeholder="Aucun objet"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Envoyer l'email test à</div>
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{userEmail}</span> {/* 👈 Email user avec icône */}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">
                            Les utilisateurs en version d'essai peuvent envoyer des emails tests uniquement à eux-mêmes.{' '}
                            <a href="#" className="text-purple-600 underline">
                                Passez à une offre supérieure
                            </a>{' '}
                            pour envoyer à d'autres.
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleSendTestEmail}>Envoyer le test</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}