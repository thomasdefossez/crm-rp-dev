"use client"

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Settings, Eye, Clipboard, Save } from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
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

  useEffect(() => {
    const loadTemplateHtml = async () => {
      let query = supabase.from("email_templates").select("body").limit(1);
      let { data, error } = await query;
      if (error) {
        console.error("Erreur lors du chargement du template :", error.message);
      }
      if (data?.body && editorRef.current) {
        editorRef.current.loadHtml(data.body);
      }
    };
    loadTemplateHtml();
  }, []);

  const exportHtml = async () => {
    if (editorRef.current) {
      editorRef.current.exportHtml(async (data: any) => {
        const { html, design } = data;

        const { error } = await supabase.from("email_templates").insert([
          {
            name: templateName || "Template sans nom",
            body: html,
            json: JSON.stringify(design || {}),
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error("Erreur lors de l'insertion Supabase :", error.message);
        } else {
          toast.success("Template sauvegardé avec succès");
        }
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center justify-between px-6 pt-6">
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
          <Button variant="outline" size="sm" onClick={() => router.push("/emails")}>
            ← Retour aux campagnes
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="icon">
                <Settings className="w-3 h-3" />
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs">
                <Eye className="w-3 h-3 mr-2" />
                Preview Email
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs">
                <Clipboard className="w-3 h-3 mr-2" />
                Copy HTML
              </Button>
              <Button variant="ghost" className="h-8 px-3 text-xs">✴ Send Email</Button>
              <Button className="bg-black text-white hover:bg-gray-800 h-8 px-3 text-xs" onClick={exportHtml}>
                <Save className="w-3 h-3 mr-2" />
                Save
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du template</label>
              <Input
                placeholder="Newsletter avril 2025"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="max-w-md"
              />

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-muted-foreground">Subject <span className="text-red-500">*</span></label>
                  <Input placeholder="Email Subject" className="w-full max-w-lg text-xs h-8 px-2 rounded-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-muted-foreground">From</label>
                  <div className="text-sm text-gray-500 w-full max-w-lg">Arik Chakma &lt;hello@maily.to&gt;</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-28 text-sm text-muted-foreground">To</label>
                  <Input placeholder="Email Recipient(s)" className="w-full max-w-lg text-xs h-8 px-2 rounded-sm" />
                </div>
                <div className="pt-4 border-t">
                  <label className="block text-sm text-muted-foreground mb-1">Preview Text</label>
                  <Input
                    placeholder="Optional short summary shown in inbox"
                    className="border-0 border-b rounded-none shadow-none px-0 text-xs h-8 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="h-[700px] border rounded-md overflow-hidden">
              <EmailEditor ref={editorRef} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}