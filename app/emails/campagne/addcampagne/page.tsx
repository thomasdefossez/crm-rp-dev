"use client"

import { useState, useEffect, Fragment } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Recipient } from "@/types/recipient";
import { useRouter } from "next/navigation";
import { useSession } from '@supabase/auth-helpers-react';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Package, ShoppingCart, Store, Truck, Check, BarChart2, MailPlus, FileText } from "lucide-react"
import SendTestEmailDialog from "@/app/emails/SendTestEmailDialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RecipientsStep from '@/app/emails/RecipientsStep';
import AddRecipientsDialog from '@/app/emails/AddRecipientsDialog';
import { Button } from "@/components/ui/button"
import TemplateDrawer from "@/components/emails/TemplateDrawer"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Page() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [emailBody, setEmailBody] = useState('');
  const hasBodyError = emailBody.replace('[unsubscribe]', '').trim() === '';
  const hasUnsubscribeLink = emailBody.includes('[unsubscribe]');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Added subject, senderName, senderEmail state
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('onboarding@resend.dev');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const allTokens = ['firstname', 'lastname', 'company', 'position', 'email'];
  const filteredTokens = allTokens.filter((token) =>
    token.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const toggleToken = (token: string) => {
    const isSelected = selectedTokens.includes(token);
    if (isSelected) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token));
    } else {
      setSelectedTokens([...selectedTokens, token]);
      setEmailBody((prev) => prev + ` {{${token}}}`);
    }
  };
  // Campaign selection state
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>('test');
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  // New states for send option and scheduled date
  const [sendOption, setSendOption] = useState<'now' | 'later' | 'draft'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const router = useRouter();
  const session = useSession();
  console.log('Session utilisateur dans addcampagne:', session);
  console.log("Page campagne montée");

  // Templates state
  const [templates, setTemplates] = useState<{ id: string; name: string; body: string }[]>([]);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase.from("email_templates").select("id, name, body");
      if (!error && data) {
        setTemplates(data);
      }
    }
    fetchTemplates();
  }, []);

  // Localise la logique d'envoi d'email
  async function sendNowEmail() {
    if (sendOption === 'later' && (!scheduledDate || isNaN(Date.parse(scheduledDate)))) {
      toast.error("Veuillez sélectionner une date et heure d’envoi valides.");
      return;
    }
    // Construction du HTML de base (sans pixel)
    const htmlToSend = emailBody.replace(/\n/g, '<br>');

    // Pour chaque destinataire, on ajoute un pixel de tracking personnalisé
    const personalizedEmails = recipients.map((recipient) => {
      const pixel = `<img src="http://localhost:3000/api/open-track?campaign=${encodeURIComponent(selectedCampaign || 'default')}&recipient=${encodeURIComponent(recipient.email)}" width="1" height="1" style="display:none;" />`;
      return {
        ...recipient,
        html: htmlToSend + pixel,
      };
    });

    const response = await fetch('/api/send-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: personalizedEmails,
        subject,
        from: {
          email: senderEmail,
          name: senderName,
        },
        campaign: selectedCampaign,
        schedule: sendOption === 'later'
          ? (scheduledDate && !isNaN(Date.parse(scheduledDate)) ? new Date(scheduledDate).toISOString() : null)
          : null,
      }),
    });

    const result = await response.json();
    if (result.success) {
      toast.success('Email envoyé avec succès !');
      setShowSuccessDialog(true);
    } else {
      toast.error('Erreur : ' + result.error.message);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <p>Debug rendu OK</p>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/emails">Emails</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nouvelle campagne</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="mt-8 px-4 flex items-center justify-between">
          <BreadcrumbList>
            {[
              { label: "Rédaction", icon: Store },
              { label: "Destinataires", icon: Truck },
              { label: "Envoi", icon: ShoppingCart },
            ].map((step, index, arr) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(index + 1)}
                    className={`flex items-center gap-2 px-0 py-0 h-auto ${
                      index + 1 === currentStep
                        ? 'font-medium text-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                    {step.label}
                  </Button>
                </BreadcrumbItem>
                {index !== arr.length - 1 && (
                  <li
                    role="presentation"
                    aria-hidden="true"
                    className="inline-block h-[2px] w-[40px] bg-muted"
                  />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
          {/* Step navigation and actions: localised Suivant/Final Send button */}
          {Number(currentStep) === 3 ? (
            <div className="flex items-center gap-2">
              {Number(currentStep) > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-sm"
                >
                  Précédent
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsSendTestDialogOpen(true)}
                disabled={!hasUnsubscribeLink || hasBodyError}
                className={`text-sm ${
                  !hasUnsubscribeLink || hasBodyError
                    ? 'bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300'
                    : ''
                }`}
              >
                Envoyer un test
              </Button>
              {Number(currentStep) === 3 && !!senderName && !!senderEmail && !!subject ? (
                <Button
                  variant="default"
                  onClick={sendNowEmail}
                  className="text-sm"
                >
                  Envoyer l’email final
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => {
                    if (Number(currentStep) === 1 && !hasBodyError && hasUnsubscribeLink) {
                      setCurrentStep(2);
                    } else if (Number(currentStep) === 2 && recipients.length > 0) {
                      setCurrentStep(3);
                    }
                  }}
                  disabled={
                    (Number(currentStep) === 1 && (hasBodyError || !hasUnsubscribeLink)) ||
                    (Number(currentStep) === 2 && recipients.length === 0)
                  }
                  className={`text-sm ${
                    ((Number(currentStep) === 1 && (hasBodyError || !hasUnsubscribeLink)) ||
                      (Number(currentStep) === 2 && recipients.length === 0))
                      ? 'bg-gray-300 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Suivant
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {Number(currentStep) > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-sm"
                >
                  Précédent
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsSendTestDialogOpen(true)}
                disabled={!hasUnsubscribeLink || hasBodyError}
                className={`text-sm ${
                  !hasUnsubscribeLink || hasBodyError
                    ? 'bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300'
                    : ''
                }`}
              >
                Envoyer un test
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (Number(currentStep) === 1 && !hasBodyError && hasUnsubscribeLink) {
                    setCurrentStep(2);
                  } else if (Number(currentStep) === 2 && recipients.length > 0) {
                    setCurrentStep(3);
                  }
                }}
                disabled={
                  (Number(currentStep) === 1 && (hasBodyError || !hasUnsubscribeLink)) ||
                  (Number(currentStep) === 2 && recipients.length === 0)
                }
                className={`text-sm ${
                  ((Number(currentStep) === 1 && (hasBodyError || !hasUnsubscribeLink)) ||
                    (Number(currentStep) === 2 && recipients.length === 0))
                    ? 'bg-gray-300 cursor-not-allowed'
                    : ''
                }`}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>

        {Number(currentStep) === 1 && (
          <div className="p-4">
            <div className="flex gap-8">
              {/* Colonne gauche */}
              <div className="flex-1 border rounded-md p-6 bg-white">
                <div className="flex gap-4 mb-4">
                  <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-sm">
                        Ajouter des tokens de personnalisation
                      </Button>
                    </DialogTrigger>
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
                      </div>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {filteredTokens.map((token) => (
                          <Button
                            key={token}
                            variant={selectedTokens.includes(token) ? "default" : "outline"}
                            className={`flex w-full items-center justify-between px-3 py-2 text-sm ${selectedTokens.includes(token) ? 'bg-purple-100 border-purple-600' : 'border-gray-200'}`}
                            onClick={() => toggleToken(token)}
                          >
                            {token}
                            {selectedTokens.includes(token) && <Check className="h-4 w-4 text-purple-600" />}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('attachment-input')?.click()}
                    className="text-sm"
                  >
                    Ajouter une pièce jointe
                  </Button>
                  <input type="file" id="attachment-input" className="hidden" />
                </div>

                {/* Bloc de sélection dynamique du template */}
                <div className="mb-4">
                  <div className="mb-2">
                    <Button
                      variant="default"
                      className="w-full max-w-xs justify-start text-sm"
                      onClick={() => setIsTemplateDrawerOpen(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choisir un template
                    </Button>
                  </div>
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      className="w-full max-w-xs justify-start text-sm"
                      onClick={() => router.push("/emails/editor")}
                    >
                      ✨ Utiliser l’éditeur visuel
                    </Button>
                  </div>
                </div>

                <textarea
                  placeholder="Écrivez ici le contenu de votre email..."
                  className="w-full h-[300px] border rounded-md p-4 text-sm resize-none"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />

                <div className="flex justify-between items-center mt-2">
                  {!hasUnsubscribeLink && (
                    <span className="text-sm text-red-600">Le lien de désinscription est manquant.</span>
                  )}
                  <Button
                    variant="ghost"
                    className="text-sm text-gray-900 hover:underline px-0 py-0 h-auto"
                    onClick={() => {
                      if (!hasUnsubscribeLink) {
                        setEmailBody((prev) => prev + '\n\n[unsubscribe]');
                      }
                    }}
                  >
                    Ajouter le lien de désinscription
                  </Button>
                </div>
              </div>
              {/* Colonne droite */}
              <div className="flex-1 border rounded-md p-6 bg-white">
                {/* Bloc des mots déclencheurs de spam (présumé existant) */}
                {/* Bloc d'analyse de la longueur du corps de l'email */}
                <div className={`border rounded-md p-4 mb-4 ${emailBody.length === 0 ? 'border-red-500' : 'border-green-500'}`}>
                  <div className={`${emailBody.length === 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {emailBody.length === 0 ? 'Aucun contenu' : 'Contenu suffisant'}
                  </div>
                  <div className="text-sm text-gray-700">Le corps contient {emailBody.length} caractères.</div>
                </div>
                <div className={`border rounded-md p-4 ${hasUnsubscribeLink ? 'border-green-500' : 'border-red-500'}`}>
                  <div className={`${hasUnsubscribeLink ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {hasUnsubscribeLink ? 'Lien de désinscription présent' : 'Lien de désinscription manquant'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {Number(currentStep) === 2 && (
          <div className="p-4 mt-8">
            <div className="flex gap-8">
              {/* Colonne gauche */}
              <div className="flex-1 border rounded-md p-6 bg-white">
                <div className="mt-2">
                  <RecipientsStep recipients={recipients} onRecipientsChange={setRecipients} />
                </div>
                <div className="flex justify-end mt-6">
                </div>
              </div>
            </div>
          </div>
        )}

        {Number(currentStep) === 3 && (
          <div className="p-4 mt-8">
            <div className="flex gap-8">
              {/* Colonne gauche */}
              <div className="flex-1 border rounded-md p-6 bg-white space-y-4">
                <h2 className="text-lg font-bold mb-4">Informations de l'expéditeur</h2>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'expéditeur</Label>
                  <Input
                    placeholder="Nom"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Email de l'expéditeur</Label>
                  <Input
                    placeholder="Email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Objet</Label>
                  <div className="flex items-center justify-between mt-2">
                    <Input
                      placeholder="Objet de l'email"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full max-w-md"
                    />
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" className="bg-indigo-50 text-indigo-600 text-sm font-medium px-3 py-2 border-indigo-100 hover:bg-indigo-100">
                        ✨ Draft with AI
                      </Button>
                      <Button variant="outline" className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-2 hover:bg-gray-200">
                        Personnaliser
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Champs supplémentaires sous Objet */}
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Checkbox id="internal-title" />
                    <Label htmlFor="internal-title" className="text-sm text-gray-700">Utiliser l’objet comme nom interne</Label>
                  </div>
                  <div className="mb-6">
                    <Label className="text-sm text-gray-700 font-medium mb-1 block">Assigner à une campagne ?</Label>
                    <div className="flex items-center gap-2">
                      {selectedCampaign ? (
                        <span
                          onClick={() => setSelectedCampaign(null)}
                          className="cursor-pointer bg-gray-100 px-3 py-1 text-sm rounded-full border hover:bg-gray-200"
                        >
                          {selectedCampaign} ✕
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Aucune campagne sélectionnée</span>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => setIsCampaignDialogOpen(true)}
                        className="text-blue-600 text-sm hover:underline px-0 py-0 h-auto"
                      >
                        Changer de campagne
                      </Button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label className="text-sm text-gray-700 font-medium block mb-1">Quand souhaitez-vous envoyer votre message ?</Label>
                    <RadioGroup
                      value={sendOption}
                      onValueChange={(val) => setSendOption(val as typeof sendOption)}
                      className="flex flex-col gap-3 mt-1"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="now" id="now" />
                        <Label htmlFor="now">Envoyer maintenant</Label>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="later" id="later" />
                        <Label htmlFor="later">Programmer plus tard</Label>
                        {sendOption === 'later' && scheduledDate && (
                          <span className="text-xs text-gray-500 ml-2">{new Date(scheduledDate).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft">Enregistrer comme brouillon</Label>
                      </div>
                    </RadioGroup>
                    {/* Conditional input for scheduling */}
                    {sendOption === 'later' && (
                      <div className="mt-2">
                        <Label className="block text-sm text-gray-600 mb-1">Date et heure d’envoi</Label>
                        <input
                          type="datetime-local"
                          className="border rounded-md p-2 text-sm w-full max-w-xs"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Votre email ne sera pas envoyé, il sera enregistré comme brouillon.</p>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsSendTestDialogOpen(true)}
                      className="text-sm"
                    >
                      Envoyer un test
                    </Button>
                    {Number(currentStep) === 3 && !!senderName && !!senderEmail && !!subject && (
                      <Button
                        variant="default"
                        onClick={sendNowEmail}
                        className="text-sm"
                      >
                        Envoyer l’email final
                      </Button>
                    )}
                    <Button variant="default" className="text-sm">Enregistrer comme brouillon</Button>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="w-[320px] border rounded-md p-6 bg-white space-y-4">
                <h2 className="text-lg font-bold">Checklist</h2>
                <div className={`border rounded-md p-4 ${!senderEmail ? 'border-red-500' : 'border-green-500'}`}>
                  <div className={`${!senderEmail ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {!senderEmail ? 'Email de l’expéditeur manquant' : 'Email de l’expéditeur renseigné'}
                  </div>
                </div>
                <div className={`border rounded-md p-4 ${!senderName ? 'border-red-500' : 'border-green-500'}`}>
                  <div className={`${!senderName ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {!senderName ? 'Nom de l’expéditeur manquant' : 'Nom de l’expéditeur renseigné'}
                  </div>
                </div>
                <div className={`border rounded-md p-4 ${!subject ? 'border-red-500' : 'border-green-500'}`}>
                  <div className={`${!subject ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {!subject ? 'Objet manquant' : 'Objet renseigné'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* SendTestEmailDialog inserted here */}
        <SendTestEmailDialog
          open={isSendTestDialogOpen}
          onOpenChange={setIsSendTestDialogOpen}
          emailBody={emailBody}
          subject={subject}
          senderName={senderName}
          senderEmail={senderEmail}
          recipients={recipients}
          onSenderNameChange={setSenderName}
          onSenderEmailChange={setSenderEmail}
        />
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Choisir une campagne</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Rechercher une campagne..."
              className="mb-4"
              // ici on pourrait ajouter une logique de filtrage
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {['Without campaign', 'test', 'ojijojo', 'Test'].map((campaign) => (
                <Button
                  key={campaign}
                  variant="ghost"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setIsCampaignDialogOpen(false);
                  }}
                  className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                >
                  <span className="material-icons text-gray-500">folder</span>
                  {campaign}
                </Button>
              ))}
            </div>
            <div className="pt-4">
              <Button variant="default" className="w-full text-sm">
                Créer une nouvelle campagne
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      {/* Success Dialog pop-in */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
          <div className="relative z-10 bg-white rounded-xl p-6 shadow-xl max-w-md w-full text-center animate-in fade-in-0 zoom-in-95">
            {/* Close button (X) */}
            <Button
              variant="ghost"
              onClick={() => setShowSuccessDialog(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-gray-900 px-2 py-1"
            >
              ✕
            </Button>
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 w-10 h-10">
                <Check className="w-5 h-5 text-green-600" />
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Email envoyé avec succès</h2>
            <p className="text-sm text-muted-foreground mb-6">Que souhaitez-vous faire ensuite ?</p>
            <div className="flex flex-col gap-2">
              <a
                href="/emails/dashboard"
                className="flex items-center gap-2 border rounded-md px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full justify-center"
              >
                <BarChart2 className="w-5 h-5 text-gray-500" />
                Voir les performances
              </a>
              <a
                href="/emails/campagne/followup"
                className="flex items-center gap-2 border rounded-md px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full justify-center"
              >
                <MailPlus className="w-5 h-5 text-gray-500" />
                Créer un email de relance
              </a>
            </div>
          </div>
        </div>
      )}
      <TemplateDrawer
        open={isTemplateDrawerOpen}
        onOpenChange={setIsTemplateDrawerOpen}
        templates={templates}
        onSelect={(body) => setEmailBody(body)}
      />
      </SidebarInset>
    </SidebarProvider>
  )
}