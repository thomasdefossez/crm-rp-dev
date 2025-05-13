"use client"

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Settings, Eye, Clipboard, Save, Store, Truck, ShoppingCart, Loader } from "lucide-react";
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

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

export default function EmailEditorPage() {
  const editorRef = useRef<any>(null);
  const router = useRouter();
  const [templateName, setTemplateName] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const loadTemplateDesign = async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("json")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data?.json && editorRef.current) {
        editorRef.current.loadDesign(JSON.parse(data.json));
        toast.success("Template chargé");
      }
    };
    loadTemplateDesign();
  }, []);

  const exportHtml = async () => {
    if (editorRef.current) {
      editorRef.current.exportHtml(async (data: any) => {
        const { html, design } = data;

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
      });
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
            <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs">
              <Eye className="w-3 h-3 mr-2" />
              Preview Email
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs"
              onClick={() => {
                if (
                  editorRef.current &&
                  isEditorReady &&
                  typeof editorRef.current.exportHtml === "function"
                ) {
                  setTimeout(() => {
                    // Vérification finale stricte de la présence de exportHtml
                    if (
                      editorRef.current &&
                      typeof editorRef.current.exportHtml === "function"
                    ) {
                      editorRef.current.exportHtml((data: any) => {
                        navigator.clipboard.writeText(data.html).then(() => {
                          toast.success("HTML copié dans le presse-papiers");
                        });
                      });
                    } else {
                      toast.error("L’éditeur n’est pas encore prêt ou exportHtml est indisponible");
                      console.warn("editorRef.current.exportHtml", editorRef.current?.exportHtml);
                    }
                  }, 250);
                } else {
                  toast.error("L’éditeur n’est pas encore prêt ou exportHtml est indisponible");
                  console.warn("editorRef.current.exportHtml", editorRef.current?.exportHtml);
                }
              }}
            >
              <Clipboard className="w-3 h-3 mr-2" />
              Copy HTML
            </Button>
            {!isEditorReady ? (
              <Button variant="ghost" className="h-8 px-3 text-xs" disabled>
                <Loader className="animate-spin w-3 h-3 mr-2" />
                Chargement éditeur...
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={async () => {
                  const handleSendTest = async () => {
                    if (editorRef.current && typeof editorRef.current.exportHtml === "function") {
                      editorRef.current.exportHtml(async (data: any) => {
                        const html = data.html;
                        const response = await fetch("/api/send-test", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ to: "success@resend.dev", subject: "Test Email", html }),
                        });
                        const result = await response.json();
                        if (result.success) {
                          toast.success("✉️ Email test envoyé avec succès ! 🎉", {
                            description: (
                              <div className="flex justify-between items-center">
                                <span>Vérifie ta boîte mail ou ouvre Resend 👀</span>
                                <a
                                  href="https://resend.com/dashboard/emails"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4 underline text-purple-600 hover:text-purple-800 text-sm"
                                  onClick={() => console.log("Lien 'Voir dans Resend' cliqué depuis le toast")}
                                >
                                  Voir dans Resend →
                                </a>
                              </div>
                            ),
                          });
                        } else {
                          toast.error("Erreur lors de l’envoi test : " + result.error);
                        }
                      });
                    }
                  };
                  await handleSendTest();
                }}
              >
                ✴ Envoyer un test
              </Button>
            )}
            <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs" onClick={exportHtml}>
              <Save className="w-3 h-3 mr-2" />
              Save
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
                onChange={(e) => setTemplateName(e.target.value)}
                className="max-w-md"
              />
 
            </div>

            <div className="h-[700px] border rounded-md overflow-hidden">
              <EmailEditor
                ref={editorRef}
                onLoad={() => {
                  setTimeout(() => {
                    if (
                      editorRef.current &&
                      typeof editorRef.current.exportHtml === "function"
                    ) {
                      setIsEditorReady(true);
                    } else {
                      console.warn("exportHtml non disponible malgré onLoad");
                    }
                  }, 500);
                }}
              />
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}