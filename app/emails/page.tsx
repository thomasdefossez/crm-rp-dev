'use client';

import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Paperclip, Mail, Trash2, AlertCircle, Lightbulb, CheckCircle } from 'lucide-react';
import AddRecipientsDialog from './AddRecipientsDialog'; // 👈 On conserve ta pop-in
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Page() {
    const [currentStep, setCurrentStep] = useState(1);
    const [sendOption, setSendOption] = useState('draft');
    const [emailBody, setEmailBody] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
    const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('onboarding@resend.dev');
    const [senderSubject, setSenderSubject] = useState('');

    // Champs checklist
    const [hasEmail, setHasEmail] = useState(false);
    const [hasSenderName, setHasSenderName] = useState(false);
    const [hasSubject, setHasSubject] = useState(false);

    // Vérification de la validité de l'email
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Détecter les changements dans l'email, le nom et le sujet
    useEffect(() => {
      setHasEmail(validateEmail(senderEmail));
      setHasSenderName(senderName.trim().length > 0);
      setHasSubject(subject.trim().length > 0);
    }, [senderEmail, senderName, subject]);

    const [isRecipientsDialogOpen, setIsRecipientsDialogOpen] = useState(false); // 👈 pop-in destinataires
    const [recipients, setRecipients] = useState<any[]>([]); // 👈 destinataires ajoutés

    // --- Ajout pour la planification ---
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
    const [scheduledTime, setScheduledTime] = useState<string>('10:00');
    const timezones = [
        { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (UTC+02:00)' },
        { value: 'Europe/Paris', label: 'Europe/Paris (UTC+02:00)' },
        { value: 'UTC', label: 'UTC (UTC+00:00)' },
    ];
    const [selectedTimezone, setSelectedTimezone] = useState(timezones[0]);

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

    // Fonction pour supprimer une pièce jointe à l'index donné
    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const fetchUserEmail = async () => {
            const { data } = await supabase.auth.getUser();
            setUserEmail(data.user?.email || null);
        };
        fetchUserEmail();
    }, []);

    const handleSendTestEmail = async () => {
        if (!userEmail) {
            toast.error('Utilisateur non connecté');
            return;
        }

        try {
            const response = await fetch('/api/send-test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: subject || 'Test Resend depuis Briefly',
                    html: emailBody ? emailBody.replace(/\n/g, '<br>') : '<p>Aucun contenu</p>',
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Email envoyé avec succès !');
                setIsSendTestDialogOpen(false);
            } else {
                toast.error('Erreur lors de l’envoi : ' + result.error.message);
            }
        } catch (error: any) {
            toast.error('Erreur lors de l’envoi : ' + error.message);
        }
    };

    // 👇 Gestion des destinataires
    const handleAddRecipients = async (newRecipients: any[]) => {
        const expandedRecipients = [];

        for (const recipient of newRecipients) {
            if (recipient.type === 'List') {
                const { data, error } = await supabase
                    .from('contact_lists')
                    .select('contacts (id, email, firstname, lastname)')
                    .eq('list_id', recipient.id);

                if (error) {
                    console.error(`Erreur lors de la récupération des contacts pour la liste ${recipient.name}`, error);
                    continue;
                }

                if (data) {
                    data.forEach((entry) => {
                        const contact = entry.contacts;
                        expandedRecipients.push({
                            id: contact.id,
                            email: contact.email,
                            name: `${contact.firstname} ${contact.lastname}`,
                            type: 'Contact',
                        });
                    });
                }
            } else {
                expandedRecipients.push(recipient);
            }
        }

        setRecipients((prev) => {
            const ids = new Set(prev.map((r) => r.id));
            return [...prev, ...expandedRecipients.filter((r) => !ids.has(r.id))];
        });

        toast.success(`${expandedRecipients.length} destinataire(s) ajouté(s) avec succès !`);
    };

    const handleRemoveRecipient = (recipientId: number) => {
        setRecipients((prev) => prev.filter((r) => r.id !== recipientId));
    };

    // --- Envoi immédiat ---
    const handleSendNow = async () => {
        if (!recipients.length || !senderEmail || !subject || !emailBody) {
            toast.error("Tous les champs requis ne sont pas remplis pour l'envoi immédiat.");
            return;
        }

        const invalidRecipients = recipients.filter((r) => {
            const email = r.email?.trim().toLowerCase();
            return !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        });

        if (invalidRecipients.length > 0) {
            toast.error(`Emails invalides détectés : ${invalidRecipients.map(r => r.email).join(', ')}`);
            console.table(invalidRecipients);
            return;
        }

        // Ajout du log avant l'envoi
        console.log('Recipients before send:', recipients);

        try {
            const response = await fetch('/api/send-now', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: recipients,
                    senderName,
                    senderEmail,
                    subject,
                    emailBody,
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Email envoyé avec succès !");
            } else {
                toast.error("Erreur lors de l'envoi : " + result.error.message);
            }
        } catch (error: any) {
            toast.error("Erreur lors de l'envoi : " + error.message);
        }
    };

    // --- Planification d'email ---
    const handleScheduleEmail = async () => {
        if (!recipients.length || !senderEmail || !subject || !scheduledDate || !scheduledTime) {
            toast.error("Tous les champs requis ne sont pas remplis pour la planification.");
            return;
        }

        // Ajout du log avant la planification
        console.log('Recipients before schedule:', recipients);

        try {
            const response = await fetch('/api/schedule-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    senderName,
                    senderEmail,
                    subject,
                    emailBody,
                    timezone: selectedTimezone.value,
                    scheduledDate: scheduledDate?.toISOString(),
                    scheduledTime,
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Email programmé avec succès !");
            } else {
                toast.error("Erreur lors de la programmation : " + result.error.message);
            }
        } catch (error: any) {
            toast.error("Erreur lors de la programmation : " + error.message);
        }
    };

    // --- Sauvegarde du brouillon ---
    const handleSaveDraft = async () => {
        try {
            const response = await fetch('/api/save-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    senderName,
                    senderEmail,
                    subject,
                    emailBody,
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success("Brouillon sauvegardé avec succès !");
            } else {
                toast.error("Erreur lors de la sauvegarde : " + result.error.message);
            }
        } catch (error: any) {
            toast.error("Erreur lors de la sauvegarde : " + error.message);
        }
    };

    const hasBodyError = emailBody.trim() === '';
    const hasUnsubscribeLink = emailBody.includes('[unsubscribe]');
    const canProceed = !hasBodyError && hasUnsubscribeLink;

    return ( 
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex items-center justify-between border-b py-4 px-8">
                <a href="/emails/dashboard" className="flex items-center text-blue-600 text-sm hover:underline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour aux emails
                </a>
                <div className="flex gap-8 text-sm text-gray-700">
                    {['Rédaction', 'Destinataires', 'Envoi'].map((step, index) => (
                        <div key={index} className={`flex items-center gap-2 ${currentStep === index + 1 ? 'font-bold text-purple-600' : ''}`}>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${currentStep === index + 1 ? 'border-purple-600 text-purple-600' : ''}`}>
                                {index + 1}
                            </div>
                            {step}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsSendTestDialogOpen(true)}>Envoyer un email</Button>
                    {currentStep === 1 && (
                        <Button className={`text-white ${canProceed ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'}`} disabled={!canProceed} onClick={() => setCurrentStep(2)}>
                            Suivant
                        </Button>
                    )}
                    {currentStep === 2 && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>Précédent</Button>
                            <Button className="text-white bg-purple-600 hover:bg-purple-700" onClick={() => setCurrentStep(3)}>
                                Suivant
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {currentStep === 1 && (
                <div className="flex flex-1">
                    <div className="flex-1 border-r p-8">
                        <div className="flex gap-2 mb-4">
                            <Button variant="outline" size="sm" onClick={() => setIsTokenDialogOpen(true)}>Ajouter des tokens de personnalisation</Button>
                            <Button variant="outline" size="sm" onClick={handleFileButtonClick}>Ajouter une pièce jointe</Button>
                        </div>
                        <textarea className="w-full h-[400px] border rounded-md p-4 text-sm" placeholder="Écrivez ici le contenu de votre email..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                        {!hasUnsubscribeLink && (
                            <div className="mt-2 text-sm text-red-600 flex items-center justify-between">
                                <span>Le lien de désinscription est manquant.</span>
                                <Button variant="link" size="sm" onClick={() => setEmailBody((prev) => prev + '\n\n[unsubscribe]')}>Ajouter le lien de désinscription</Button>
                            </div>
                        )}
                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="text-sm font-medium text-gray-700">Pièces jointes :</div>
                                {attachments.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center border rounded px-3 py-2 text-sm text-gray-700"
                                  >
                                    <div className="truncate max-w-[200px] flex items-center gap-2">
                                      <Paperclip className="w-4 h-4 text-gray-500" />
                                      {file.name}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveAttachment(idx)}
                                      className="text-xs text-gray-500 hover:text-red-600 hover:underline transition"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                ))}
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                    </div>
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
            )}

            {currentStep === 2 && (
                <div className="p-8">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-bold">Destinataires ajoutés</h2>
                        <Button variant="outline" size="sm" onClick={() => setIsRecipientsDialogOpen(true)}>Ajouter des destinataires</Button>
                    </div>
                    <div className="border rounded-md">
                        {recipients.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">Aucun destinataire ajouté.</div>
                        ) : (
                            recipients.map((recipient) => (
                                <div key={recipient.id} className="flex justify-between items-center border-b last:border-0 px-4 py-2 text-sm">
                                    <div>
                                        <div className="font-medium">{recipient.name}</div>
                                        <div className="text-xs text-gray-500">{recipient.type}</div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRecipient(recipient.id)}>
                                        <Trash2 className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="flex flex-1">
                    {/* Colonne gauche - Formulaire */}
                    <div className="w-[60%] border-r p-8 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
                        {/* Bloc d'information obligatoire */}
                        <div className="border rounded-md bg-blue-50 p-4 text-sm text-gray-700 space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="text-blue-600 mt-0.5 flex-shrink-0 flex items-center">
                              <svg width="20" height="20" fill="none" className="block"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M10 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>
                            </div>
                            <p className="px-4 py-3">
                                Gardez à l'esprit qu'à partir du 1er février 2024, tous les clients de Prowly devront authentifier leur domaine afin d'envoyer des emails. Ce changement fait suite aux nouvelles politiques de <a href="#" className="underline">Google</a> et <a href="#" className="underline">Yahoo</a>.
                            </p>
                          </div>
                          <button className="border rounded-full px-3 py-1 text-xs hover:bg-gray-100 transition">En savoir plus</button>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Nom de l'expéditeur</label>
                            <input
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="Nom de l'expéditeur"
                              className="w-full border rounded-md p-2 max-w-[160px]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email de l'expéditeur</label>
                            <input
                              type="email"
                              value={senderEmail}
                              onChange={(e) => setSenderEmail(e.target.value)}
                              placeholder="Email de l'expéditeur"
                              className="w-full border rounded-md p-2 max-w-[240px]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Sujet</label>
                            <input
                              type="text"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Sujet de l'email"
                              className="w-full border rounded-md p-2 max-w-[240px]"
                            />
                        </div>
                        {/* Additional options */}
                        <div>
                            <button className="text-blue-600 text-sm hover:underline">Ajouter un texte d’aperçu</button>
                        </div>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Internal title</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input type="checkbox" checked readOnly className="form-checkbox text-blue-600" />
                                    <span className="text-sm text-gray-700">Utiliser l’objet de l’email comme nom interne</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Assigner à une campagne ?</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-gray-500 text-sm">None</span>
                                    <button className="text-blue-600 text-sm hover:underline">Select campaign</button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="text-lg font-bold text-gray-900">Quand souhaitez-vous envoyer ce message ?</label>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="send_time"
                                        value="now"
                                        className="form-radio text-blue-600"
                                        checked={sendOption === 'now'}
                                        onChange={() => setSendOption('now')}
                                    />
                                    <span className="text-sm text-gray-700">Envoyer maintenant</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="send_time"
                                        value="later"
                                        className="form-radio text-blue-600"
                                        checked={sendOption === 'later'}
                                        onChange={() => setSendOption('later')}
                                    />
                                    <span className="text-sm text-gray-700">Programmer pour plus tard </span>
                                </div>
                                {sendOption === 'later' && (
                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Choisir une date</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                                        {scheduledDate ? scheduledDate.toLocaleDateString('fr-FR') : "Sélectionner une date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={scheduledDate}
                                                        onSelect={setScheduledDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Choisir une heure</label>
                                          <div className="w-[150px]">
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button variant="outline" className="justify-start text-left font-normal">
                                                  {scheduledTime || "Sélectionner une heure"}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent align="start" className="w-auto p-0">
                                                <Input
                                                  type="time"
                                                  value={scheduledTime}
                                                  onChange={(e) => setScheduledTime(e.target.value)}
                                                  className="w-full border-none focus-visible:ring-0"
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Choisir un fuseau horaire</label>
                                            <Select
                                                options={timezones}
                                                value={selectedTimezone}
                                                onChange={setSelectedTimezone}
                                                className="w-[300px] text-sm"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Votre heure actuelle est basée sur votre compte.</p>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="send_time"
                                        value="draft"
                                        className="form-radio text-blue-600"
                                        checked={sendOption === 'draft'}
                                        onChange={() => setSendOption('draft')}
                                    />
                                    <span className="text-sm text-gray-700">Enregistrer comme brouillon</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Votre email ne sera pas envoyé, il sera enregistré comme brouillon..</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsSendTestDialogOpen(true)}>
                                Envoyer un test
                            </Button>
                            <Button onClick={() => {
                                if (sendOption === 'now') {
                                    handleSendNow();
                                } else if (sendOption === 'later') {
                                    handleScheduleEmail();
                                } else {
                                    handleSaveDraft();
                                }
                            }}>
                                {sendOption === 'now' ? "Envoyer maintenant" : sendOption === 'later' ? "Programmer" : "Enregistrer comme brouillon"}
                            </Button>
                        </div>
                    </div>

                    {/* Colonne droite - Checklist */}
                    <div className="w-[300px] p-8">
                        <h2 className="text-lg font-bold mb-4">Checklist</h2>
                        <div className="mt-6">
                            <h3 className="text-lg font-bold mb-2">Pitch en toute confiance</h3>
                            {/* Calcul du nombre d'erreurs, suggestions et validés */}
                            {(() => {
                                const errors = [!hasEmail, !hasSenderName, !hasSubject].filter(Boolean).length;
                                const suggestions = 1; // Ajustez la logique si besoin
                                const valid = [hasEmail, hasSenderName, hasSubject].filter(Boolean).length;
                                return (
                                    <div className="flex items-center gap-8 mb-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-sm">{errors} erreurs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                                            <span className="text-sm">{suggestions} suggestion</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-sm">{valid} validé</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="space-y-4 text-sm mt-6">
                            {!hasEmail && (
                                <div className="text-sm text-red-600">Adresse email manquante</div>
                            )}
                            {!hasSenderName && (
                                <div className="text-sm text-red-600">Nom de l'expéditeur manquant</div>
                            )}
                            {!hasSubject && (
                                <div className="text-sm text-red-600">Sujet manquant</div>
                            )}
                            {hasEmail && (
                                <div className="text-sm text-green-600">Adresse email présente</div>
                            )}
                            {hasSenderName && (
                                <div className="text-sm text-green-600">Nom expéditeur présent</div>
                            )}
                            {hasSubject && (
                                <div className="text-sm text-green-600">Sujet présent</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <AddRecipientsDialog
                open={isRecipientsDialogOpen}
                onOpenChange={setIsRecipientsDialogOpen}
                onAddRecipients={handleAddRecipients}
                DialogContentProps={{
                    'aria-describedby': 'description-recipients'
                }}
                descriptionId="description-recipients"
            />
            {/* Dialog tokens */}
            <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogContent aria-describedby="description-tokens">
                    <DialogHeader>
                        <DialogTitle>Ajouter des tokens de personnalisation</DialogTitle>
                    </DialogHeader>
                    <p id="description-tokens" className="sr-only">
                        Sélectionnez les tokens à insérer dans le contenu de votre email.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTokens.map((token) => (
                            <Badge key={token} variant="outline" className="cursor-pointer" onClick={() => toggleToken(token)}>
                                {token} ✕
                            </Badge>
                        ))}
                    </div>
                    <div className="relative mb-4">
                        <Input placeholder="Rechercher un token..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-auto">
                        {filteredTokens.map((token) => (
                            <button key={token} className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ${selectedTokens.includes(token) ? 'bg-purple-100 border-purple-600' : 'border-gray-200'}`} onClick={() => toggleToken(token)}>
                                {token}
                                {selectedTokens.includes(token) && <Check className="h-4 w-4 text-purple-600" />}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog test email */}
            <Dialog open={isSendTestDialogOpen} onOpenChange={setIsSendTestDialogOpen}>
                <DialogContent className="max-w-sm" aria-describedby="description-test-email">
                    <DialogHeader>
                        <DialogTitle>Envoyer un email test</DialogTitle>
                    </DialogHeader>
                    <p id="description-test-email" className="sr-only">
                        Ce test n'affichera pas votre nom ni votre email comme expéditeur.
                    </p>
                    <div className="text-sm text-gray-600 mb-4">Le test <strong>n'affichera pas</strong> votre nom ni votre email comme expéditeur.</div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Nom de l'expéditeur</div>
                            <div className="text-sm font-medium text-gray-900">Prowly (onboarding@resend.dev)</div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Objet</div>
                            <Input placeholder="Aucun objet" value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Envoyer à</div>
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{userEmail}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">Les utilisateurs en essai peuvent envoyer des emails tests uniquement à eux-mêmes.</div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsSendTestDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleSendTestEmail}>Envoyer le test</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}