"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Settings, Eye, Clipboard, Save, Store, Truck, ShoppingCart, Loader, Trash2, Send, Image as ImageIcon } from "lucide-react";
import { Fragment } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Editor } from '@maily-to/core';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

export default function EmailEditorPage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [subject, setSubject] = useState("");
  const [senderEmail, setSenderEmail] = useState("onboarding@resend.dev");
  const [senderName, setSenderName] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false);

  const MailyEditor = Editor;

  // Fonction pour gérer l'upload de l'image
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (file) {
        // Créer un nom unique pour l'image en nettoyant le nom du fichier
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_').replace(/[^\w\-_.]/g, '')}`;

        // Télécharge l'image dans le Bucket Supabase
        const { data, error } = await supabase
            .storage
            .from('email-templates') // Nom du Bucket
            .upload(fileName, file, { upsert: true });

        if (error) {
          toast.error(`Erreur lors du téléchargement de l'image: ${error.message || error}`);
          console.error("Erreur détaillée : ", error);
        } else {
          // Une fois téléchargé, on peut obtenir l'URL publique
          const publicURL = supabase
              .storage
              .from('email-templates')
              .getPublicUrl(fileName).data.publicUrl;

          // Affiche un toast avec l'URL pour vérification
          toast.success(`Image téléchargée : ${publicURL}`);

          // Si tu veux insérer l'image dans l'éditeur, tu peux ajouter l'URL dans le contenu
          const editor = (window as any).editorRef;
          if (editor) {
            editor.commands.insertContent(`<img src="${publicURL}" alt="Image" />`);
          }
        }
      }
    };
    input.click(); // Simule un clic pour ouvrir le sélecteur de fichier
  };

  // Charger le template existant
  useEffect(() => {
    const loadTemplateDesign = async () => {
      const { data, error } = await supabase
          .from("email_templates")
          .select("json")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

      if (data?.json && (window as any).editorRef) {
        const editor = (window as any).editorRef;
        if (editor && typeof editor.commands.setContent === "function") {
          editor.commands.setContent(JSON.parse(data.json));
          toast.success("Template chargé");
        }
      }
    };

    loadTemplateDesign();
  }, []);

  const exportHtml = async () => {
    const editor = (window as any).editorRef;
    if (editor && typeof editor.getHTML === "function") {
      const html = editor.getHTML();
      const design = editor.getJSON();

      console.log("✅ HTML EXPORTÉ", html);
      console.log("🧩 DESIGN JSON", design);

      const { error } = await supabase.from("email_templates").insert([
        {
          name: templateName || "Template sans nom",
          body: html,
          json: JSON.stringify(design),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Erreur lors de l'insertion Supabase :", error.message);
      } else {
        toast.success(
            <span>
            Template sauvegardé avec succès
            <a
                href="https://resend.com/dashboard/emails"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 underline text-purple-600 hover:text-purple-800 text-sm"
                onClick={() => console.log("Lien 'Voir dans Resend' cliqué depuis le toast")}
            >
              Voir dans Resend →
            </a>
          </span>
        );
      }
    } else {
      toast.error("Impossible d'exporter : l’éditeur n’est pas encore prêt.");
    }
  };

  const resetEditorContent = () => {
    const editor = (window as any).editorRef;
    if (editor && typeof editor.commands.setContent === "function") {
      editor.commands.setContent("");
      toast.success("Contenu de l’éditeur réinitialisé");
    } else {
      toast.error("Impossible de réinitialiser : l’éditeur n’est pas prêt.");
    }
  };

  // Fonction d'envoi immédiat de l'email, avec vérification du nom du template
  const sendNowEmail = async (sendOption: string, scheduledDate?: string) => {
    if (!templateName || templateName.trim() === "") {
      toast.error("Veuillez renseigner un nom de template avant d'envoyer l'email.");
      return;
    }

    // Construction du contenu HTML de l'email
    const emailBodyContent = emailBody.replace(/\n/g, '<br>');

    // Préparation des emails personnalisés
    const personalizedHtml = emailBodyContent +
        `<img src="http://localhost:3000/api/open-track?campaign=${encodeURIComponent(subject)}&recipient={{email}}" width="1" height="1" style="display:none;" />`;

    const toEmails = recipients.map((recipient) => recipient.email);

    // Appel à l'API pour envoyer l'email via la fonction `send-now`
    try {
      const response = await fetch('/api/send-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: toEmails,
          subject,
          senderEmail,
          senderName,
          html: personalizedHtml,
          schedule: sendOption === 'later'
              ? (scheduledDate && !isNaN(Date.parse(scheduledDate)) ? new Date(scheduledDate).toISOString() : null)
              : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("✉️ Email envoyé avec succès ! 🎉");
      } else {
        toast.error("Erreur lors de l’envoi de l’email : " + result.error.message);
      }

    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email.");
      console.error(error);
    }
  };

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/emails">Campagnes</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Éditeur</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="mt-8 px-4 flex items-center justify-between">
            <BreadcrumbList>
              {[
                { label: "Rédaction", icon: Store, active: true },
                { label: "Destinataires", icon: Truck },
                { label: "Envoi", icon: ShoppingCart },
              ].map((step, index, arr) => (
                  <Fragment key={index}>
                    <BreadcrumbItem>
                      <Button
                          variant="ghost"
                          className={`flex items-center gap-2 px-0 py-0 h-auto ${
                              step.active ? "font-medium text-purple-600" : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        <step.icon className="h-5 w-5" />
                        {step.label}
                      </Button>
                    </BreadcrumbItem>
                    {index !== arr.length - 1 && (
                        <li
                            key={`separator-${index}`}
                            role="presentation"
                            aria-hidden="true"
                            className="inline-block h-[2px] w-[40px] bg-muted"
                        />
                    )}
                  </Fragment>
              ))}
            </BreadcrumbList>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                  className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs"
                  onClick={async () => {
                    const editor = (window as any).editorRef;
                    if (editor && typeof editor.getHTML === "function") {
                      const html = editor.getHTML();
                      const previewWindow = window.open();
                      previewWindow?.document.write(html);
                      previewWindow?.document.close();
                    } else {
                      toast.error("L’éditeur n’est pas prêt ou getHTML indisponible");
                    }
                  }}
              >
                <Eye className="w-3 h-3 mr-2" />
                Preview Email
              </Button>
              {!isEditorReady ? (
                  <Button variant="ghost" className="h-8 px-3 text-xs" disabled>
                    <Loader className="animate-spin w-3 h-3 mr-2" />
                    Chargement éditeur...
                  </Button>
              ) : (
                  <Button
                      className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs"
                      onClick={async () => {
                        const handleSendTest = async () => {
                          const editor = (window as any).editorRef;
                          if (editor && typeof editor.getHTML === "function") {
                            const html = editor.getHTML();
                            console.log("🧪 Contenu HTML pour test :", html);
                            const response = await fetch("/api/send-test-email", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ to: senderEmail, subject: "Test Email", html }),
                            });
                            const result = await response.json();
                            if (result.success) {
                              toast.success("✉️ Email test envoyé avec succès ! 🎉");
                            } else {
                              toast.error("Erreur lors de l’envoi test : " + result.error);
                            }
                          } else {
                            toast.error("L’éditeur n’est pas prêt ou getHTML indisponible");
                          }
                        };
                        await handleSendTest();
                      }}
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Envoyer un test
                  </Button>
              )}
              <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs" onClick={exportHtml}>
                <Save className="w-3 h-3 mr-2" />
                Save
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={resetEditorContent}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Réinitialiser le contenu
              </Button>
              {/* Bouton Ajouter une image avec icône, maintenant au même niveau */}
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImageUpload}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div
                className={`transition-all duration-300 ${
                    templateName
                        ? "opacity-0 max-h-0 overflow-hidden"
                        : "opacity-100 max-h-20 mb-4"
                }`}
            >
              <div className="bg-muted text-muted-foreground text-sm p-3 rounded animate-in fade-in slide-in-from-bottom">
                Commencez par donner un nom à votre template pour l’enregistrer plus tard ✨
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du template</label>
              <Input
                  placeholder="Newsletter avril 2025"
                  value={templateName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTemplateName(value);
                  }}
                  className="max-w-md"
              />

            </div>

            <div className="min-h-[700px] max-h-[90vh] overflow-auto border rounded-md">
              <MailyEditor
                  onCreate={(editor) => {
                    setIsEditorReady(true);
                    (window as any).editorRef = editor;
                  }}
                  config={{
                    wrapClassName: "max-w-screen-md mx-auto",
                    contentClassName: "text-center",
                    bodyClassName: "text-center",
                    spellCheck: false,  // Ajoutez d'autres configurations nécessaires ici
                  }}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}