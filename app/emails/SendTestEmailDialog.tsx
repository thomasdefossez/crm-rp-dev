'use client';

import { supabase } from '@/lib/supabaseClient';

import type { Recipient } from '@/types/recipient'; // Remplace le chemin si différent
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react'; // 👈 Ajout icône Mail
import { PlusCircle, FileText, Sparkles, Trash2, Paperclip } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { toast } from 'sonner'; // Toaster
import { useSession } from '@supabase/auth-helpers-react'; // Supabase Auth
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SendTestEmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: string;
    trigger?: React.ReactNode; // facultatif pour compatibilité
    senderName: string;
    senderEmail: string;
    to: string;
    body: string;
    onToChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onBodyChange: (value: string) => void;
    onSenderNameChange: (value: string) => void;
    onSenderEmailChange: (value: string) => void;
    recipients: Recipient[];
}

export function SendTestEmailDialog({
    open,
    onOpenChange,
    trigger,
    senderName,
    senderEmail,
    onSenderNameChange,
    onSenderEmailChange,
    recipients,
    body,
    onBodyChange
}: SendTestEmailDialogProps) {
    const session = useSession();

    const [mode, setMode] = useState<'default' | 'create-template'>('default');
    // Nouveaux états pour le nom et le contenu du template en cours de création
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateBody, setNewTemplateBody] = useState('');
    const [subject, setSubject] = useState('');
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [availableTemplates, setAvailableTemplates] = useState<{ id: string; name: string; body: string; type?: string; created_at?: string }[]>([]);

    useEffect(() => {
      if (session?.user) {
        const { user_metadata } = session.user;
        if (user_metadata) {
          if (!senderName && typeof onSenderNameChange === 'function') {
            onSenderNameChange(user_metadata.name || '');
          }
          if (!senderEmail && typeof onSenderEmailChange === 'function') {
            onSenderEmailChange(session.user.email || '');
          }
        }
      }
    }, [session]);

    useEffect(() => {
      const fetchTemplates = async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('id, name, body, type, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          toast.error('Erreur lors du chargement des templates');
        } else {
          setAvailableTemplates(data || []);
        }
      };

      fetchTemplates();
    }, []);

    console.log("Session Supabase:", session);

    if (!session?.user) {
        console.warn("Aucun utilisateur connecté. L'envoi d'email test est limité.");
        toast.warning("Vous devez être connecté pour envoyer un email test.");
    }

    const userEmail = session?.user?.email || 'success@resend.dev'; // Utilisateur connecté ou fallback Resend

    const handleSendTestEmail = async () => {
        const htmlContent = body ? body.replace(/\n/g, '<br>') : '<p>Aucun contenu</p>';

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
                <DialogContent className="w-full max-w-2xl rounded-lg p-6">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold text-gray-900">Compose email</DialogTitle>
                    </DialogHeader>

                    {mode === 'default' && (
                      <div className="mt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-medium text-gray-600 tracking-wide mb-1">From</div>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 text-sm text-gray-800 font-normal shadow-sm">
                              <div className="bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold text-white shadow">T</div>
                              <div className="flex flex-col">
                                <span>{senderName}</span>
                                <span className="text-xs text-gray-500">{senderEmail}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600 tracking-wide">To</span>
                              {!showCcBcc && (
                                <button type="button" onClick={() => setShowCcBcc(true)} className="text-xs text-blue-600 hover:underline">
                                  Add CC / BCC
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 text-sm text-gray-800 font-normal shadow-sm">
                              <div className="bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold text-white shadow">C</div>
                              {userEmail}
                            </div>
                            {showCcBcc && (
                              <div className="mt-3 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                  <label className="text-xs font-medium text-gray-600 mb-1" htmlFor="cc">CC</label>
                                  <Input id="cc" placeholder="Enter CC emails" value={cc} onChange={(e) => setCc(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs font-medium text-gray-600 mb-1" htmlFor="bcc">BCC</label>
                                  <Input id="bcc" placeholder="Enter BCC emails" value={bcc} onChange={(e) => setBcc(e.target.value)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-gray-600 tracking-wide mb-1">Subject</div>
                          <Input placeholder="Enter subject..." value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>

                        <div>
                          <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            rows={6}
                            placeholder="Start typing... or create a template"
                            value={body}
                            onChange={(e) => onBodyChange(e.target.value)}
                          />
                        </div>

                        <div className="text-xs text-gray-500 italic">Templates that you favorite will appear here</div>

                        <TooltipProvider>
                          <div className="flex gap-2">
                            <Popover open={templateMenuOpen} onOpenChange={setTemplateMenuOpen}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <PopoverTrigger asChild>
                                    <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Voir les templates</TooltipContent>
                              </Tooltip>
                              <PopoverContent side="bottom" align="start" className="w-64 p-0" style={{ maxHeight: '240px', overflowY: 'auto', zIndex: 50 }}>
                                <div className="p-2 space-y-1">
                                  {availableTemplates.map((template) => (
                                    <div
                                      key={template.id}
                                      onClick={() => {
                                        setSelectedTemplate(template.name);
                                        onBodyChange(template.body || '');
                                        setTemplateMenuOpen(false);
                                        toast.success(`Template "${template.name}" chargé.`);
                                      }}
                                      className="px-2 py-2 hover:bg-muted cursor-pointer rounded text-sm"
                                    >
                                      <div className="font-medium text-xs truncate">{template.name || "Template sans nom"}</div>
                                      <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>{template.type || 'standard'}</span>
                                        <span>{template.created_at ? new Date(template.created_at).toLocaleDateString('fr-FR') : ''}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition" onClick={() => setMode('create-template')}>
                                  <PlusCircle className="w-4 h-4 text-gray-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Créer une template</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition">
                                  <Sparkles className="w-4 h-4 text-gray-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Suggestions IA</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-red-100 rounded-full transition">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer le contenu</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    )}

                    {mode === 'create-template' && (
                      <div className="mt-4 space-y-4 min-h-[400px] flex flex-col justify-between">
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-800">Créer un nouveau template</h3>
                          <Input
                            placeholder="Nom du template"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                          />
                          <textarea
                            placeholder="Contenu du template"
                            className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            rows={6}
                            value={newTemplateBody}
                            onChange={(e) => setNewTemplateBody(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition" title="Ajouter une pièce jointe">
                                  <Paperclip className="w-4 h-4 text-gray-600" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Ajouter une pièce jointe</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition" title="Champs de fusion">
                                  <span className="text-xs font-semibold text-gray-600">{'{ }'}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Champs de fusion</TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => { setMode('default'); setNewTemplateName(''); setNewTemplateBody(''); }}>
                              Retour
                            </Button>
                            <Button
                              onClick={async () => {
                                if (!newTemplateName || !newTemplateBody) {
                                  toast.error("Nom et contenu du template requis.");
                                  return;
                                }

                                const { error } = await supabase.from('email_templates').insert({
                                  name: newTemplateName,
                                  body: newTemplateBody,
                                  type: 'standard',
                                });

                                if (error) {
                                  toast.error("Erreur lors de l'enregistrement du template");
                                } else {
                                  toast.success("Template enregistré avec succès");
                                  onBodyChange(newTemplateBody);
                                  setMode('default');
                                  setNewTemplateName('');
                                  setNewTemplateBody('');
                                  const { data } = await supabase
                                    .from('email_templates')
                                    .select('id, name, body, type, created_at')
                                    .order('created_at', { ascending: false });
                                  setAvailableTemplates(data || []);
                                }
                              }}
                            >
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {mode === 'default' && (
                      <div className="flex justify-between items-center mt-6">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input type="checkbox" className="form-checkbox" />
                          Send emails individually
                        </label>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                          <Button onClick={handleSendTestEmail}>Send</Button>
                        </div>
                      </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SendTestEmailDialog;