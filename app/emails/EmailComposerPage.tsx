"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Paperclip } from 'lucide-react';
import RecipientsStep from './RecipientsStep';
import { SendTestEmailDialog } from './SendTestEmailDialog'; // 👈 Import pop-in as named import

export default function EmailComposerPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [emailBody, setEmailBody] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
    const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false); // 👈 Pop-in state

    const allTokens = ['Nom', 'Prénom', 'Organisation', 'Civilité', 'Email', 'Téléphone', 'Ville', 'Pays'];

    const filteredTokens = allTokens.filter((token) =>
        token.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleToken = (token: string) => {
        if (selectedTokens.includes(token)) {
            setSelectedTokens(selectedTokens.filter((t) => t !== token));
        } else {
            setSelectedTokens([...selectedTokens, token]);
        }
    };

    useEffect(() => {
        if (!isTokenDialogOpen && selectedTokens.length > 0) {
            const tokensText = selectedTokens.map((token) => `{{${token}}}`).join(' ');
            setEmailBody((prev) => prev + ' ' + tokensText);
            setSelectedTokens([]);
            setSearchQuery('');
        }
    }, [isTokenDialogOpen]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setAttachments([...attachments, ...Array.from(files)]);
        }
    };

    const hasBodyError = emailBody.trim() === '';
    const hasUnsubscribeLink = emailBody.includes('[unsubscribe]');
    const canProceed = !hasBodyError && hasUnsubscribeLink;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b py-4 px-8">
                <div className="flex gap-8 text-sm text-gray-700 justify-center w-full">
                    {['Rédaction', 'Destinataires', 'Personnalisation', 'Envoi'].map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-2 ${
                                currentStep === index + 1 ? 'font-bold text-purple-600' : ''
                            }`}
                        >
                            <div
                                className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                    currentStep === index + 1 ? 'border-purple-600 text-purple-600' : ''
                                }`}
                            >
                                {index + 1}
                            </div>
                            {step}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsSendTestDialogOpen(true)}
                    >
                        Envoyer un email
                    </Button>
                    {currentStep === 1 && (
                        <Button
                            className={`text-white ${
                                canProceed ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                            disabled={!canProceed}
                            onClick={() => setCurrentStep(2)}
                        >
                            Suivant
                        </Button>
                    )}
                </div>
            </div>

            {/* Contenu */}
            {currentStep === 1 ? (
                <div className="flex flex-1">
                    {/* Colonne gauche */}
                    <div className="flex-1 border-r p-8">
                        <div className="flex gap-2 mb-4">
                            <Button variant="outline" size="sm" onClick={() => setIsTokenDialogOpen(true)}>
                                Ajouter des tokens de personnalisation
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleFileButtonClick}>
                                Ajouter une pièce jointe
                            </Button>
                        </div>
                        <textarea
                            className="w-full h-[400px] border rounded-md p-4 text-sm"
                            placeholder="Écrivez ici le contenu de votre email..."
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                        />
                        {!hasUnsubscribeLink && (
                            <div className="mt-2 text-sm text-red-600 flex items-center justify-between">
                                <span>Le lien de désinscription est manquant.</span>
                                <Button variant="link" size="sm" onClick={() => setEmailBody(prev => prev + '\n\n[unsubscribe]')}>
                                    Ajouter le lien de désinscription
                                </Button>
                            </div>
                        )}

                        {/* Pièces jointes */}
                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium text-gray-700">Pièces jointes :</div>
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Paperclip className="h-4 w-4 text-gray-500" />
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input file */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Colonne droite */}
                    <div className="w-[300px] p-8">
                        <h2 className="text-lg font-bold mb-4">Améliorez votre contenu</h2>
                        <div className="space-y-4 text-sm">
                            <div className={`border rounded-md p-4 ${hasBodyError ? 'border-red-500' : 'border-green-500'}`}>
                                <div className={`${hasBodyError ? 'text-red-600' : 'text-green-600'} font-medium`}>
                                    {hasBodyError ? '1 erreur' : 'Aucune erreur'}
                                </div>
                                <div>{hasBodyError ? "Le corps de l'email est vide" : "Le corps de l'email est rempli"}</div>
                            </div>
                            <div className={`border rounded-md p-4 ${hasUnsubscribeLink ? 'border-green-500' : 'border-red-500'}`}>
                                <div className={`${hasUnsubscribeLink ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                    {hasUnsubscribeLink ? 'Lien de désinscription présent' : 'Lien de désinscription manquant'}
                                </div>
                            </div>
                            <div className="border rounded-md p-4">
                                <div className="text-green-600 font-medium">Mots déclencheurs de spam</div>
                                <div>Aucun détecté</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <RecipientsStep />
            )}

            {/* Popin Tokens */}
            <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter des tokens de personnalisation</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTokens.map((token) => (
                            <Badge key={token} variant="outline" className="cursor-pointer" onClick={() => toggleToken(token)}>
                                {token} ✕
                            </Badge>
                        ))}
                    </div>
                    <div className="relative mb-4">
                        <Input
                            placeholder="Rechercher un token..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-auto">
                        {filteredTokens.map((token) => (
                            <button
                                key={token}
                                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${
                                    selectedTokens.includes(token) ? 'bg-purple-100 border-purple-600' : 'border-gray-200'
                                }`}
                                onClick={() => toggleToken(token)}
                            >
                                {token}
                                {selectedTokens.includes(token) && <Check className="h-4 w-4 text-purple-600" />}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Popin Send Test Email */}
            <SendTestEmailDialog
                open={isSendTestDialogOpen}
                onOpenChange={setIsSendTestDialogOpen}
                emailBody={emailBody} // 👈 Passe le contenu ici
            />
        </div>
    );
}
