'use client';

import type { Recipient } from '@/types/recipient'; // Remplace le chemin si différent
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react'; // 👈 Ajout icône Mail
import { useState, useEffect } from 'react';
import { toast } from 'sonner'; // Toaster
import { useSession } from '@supabase/auth-helpers-react'; // Supabase Auth

interface SendTestEmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    emailBody: string;
    subject: string;
    trigger?: React.ReactNode; // facultatif pour compatibilité
    senderName: string;
    senderEmail: string;
    onSenderNameChange: (value: string) => void;
    onSenderEmailChange: (value: string) => void;
    recipients: Recipient[];
}

export function SendTestEmailDialog({
    open,
    onOpenChange,
    emailBody,
    trigger,
    senderName,
    senderEmail,
    onSenderNameChange,
    onSenderEmailChange,
    recipients,
}: SendTestEmailDialogProps) {
    const session = useSession();

    useEffect(() => {
      if (session?.user) {
        const { user_metadata } = session.user;
        if (user_metadata) {
          if (!senderName) onSenderNameChange(user_metadata.name || '');
          if (!senderEmail) onSenderEmailChange(session.user.email || '');
        }
      }
    }, [session]);

    console.log("Session Supabase:", session);

    if (!session?.user) {
        console.warn("Aucun utilisateur connecté. L'envoi d'email test est limité.");
        toast.warning("Vous devez être connecté pour envoyer un email test.");
    }

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
                    senderName,
                    senderEmail,
                    recipients,
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
                onOpenChange(false); // Fermer la popin après succès
            } else {
                toast.error('Erreur lors de l’envoi : ' + result.error.message);
            }
        } catch (error: any) {
            toast.error('Erreur lors de l’envoi : ' + error.message);
        }
    };

    return (
        <>
            {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
            <Dialog open={open} onOpenChange={onOpenChange}>
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
                            <Input
                                placeholder="Nom de l'expéditeur"
                                value={senderName}
                                onChange={(e) => onSenderNameChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Email de l'expéditeur</div>
                            <Input
                                placeholder="Email de l'expéditeur"
                                type="email"
                                value={senderEmail}
                                onChange={(e) => onSenderEmailChange(e.target.value)}
                            />
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
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
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

export default SendTestEmailDialog;