"use client";
import {
  Sidebar
} from "@/components/ui/sidebar";
import {
  User,
  Upload,
  Settings,
  Mail,
  Download,
  Loader
} from "lucide-react";

import * as XLSX from "xlsx";

import {
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import FileUploadButton from '@/components/ui/FileUploadButton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function ImportSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [unknownHeaders, setUnknownHeaders] = useState<string[]>([]);
  const knownFields = ["firstname", "lastname", "email", "phone", "company_name", "region", "role", "editeur", "contact_type"];

  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const router = useRouter();

  const handleImport = async () => {
    if (!contacts.length) return;
    setIsLoading(true);
    const { error } = await supabase.from("contacts").insert(contacts);
    if (error) {
      toast.error("Erreur lors de l'import : " + error.message);
    } else {
      toast.success("🎉 Import réussi !", {
        description: `${contacts.length} contacts ont été ajoutés avec succès dans Supabase.`,
        duration: 4000,
      });

      const { data: check, error: checkError } = await supabase
        .from("contacts")
        .select("email")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!checkError && check.length > 0) {
        toast(`✅ Dernier contact importé : ${check[0].email}`, {
          duration: 3000,
        });
      }
      setTimeout(() => {
        router.push("/contacts/page-test");
      }, 1000);
    }
    setIsLoading(false);
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="px-6 pt-6 space-y-6">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/contacts">Contacts</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Import contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold tracking-tight mt-4">Importer des contacts</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6 text-sm text-gray-800">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Add contacts to lists?</p>
                  <button className="text-primary font-medium hover:underline whitespace-nowrap">+ Add lists</button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Add tags to contacts?</p>
                  <button className="text-primary font-medium hover:underline whitespace-nowrap">+ Add tags</button>
                </div>
                {showPreview && contacts.length > 0 && (
                  <div className="border rounded-md p-4 bg-muted/50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du fichier</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-48 overflow-y-auto pr-2">
                      {contacts.slice(0, 10).map((c, i) => (
                        <li key={i}>
                          {c.firstname} {c.lastname} — {c.email}
                        </li>
                      ))}
                      {contacts.length > 10 && (
                        <li className="italic text-xs text-muted-foreground">
                          …et {contacts.length - 10} autres contacts
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {unknownHeaders.length > 0 && (
                  <div className="border rounded-md p-4 bg-muted/50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">🛠 Mapper les colonnes inconnues</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {unknownHeaders.map((header) => (
                        <li key={header} className="flex items-center gap-2">
                          <span className="font-medium">{header}</span>
                          →
                          <Select
                            value={columnMapping[header] || ""}
                            onValueChange={(value) =>
                              setColumnMapping((prev) => ({ ...prev, [header]: value }))
                            }
                          >
                            <SelectTrigger className="w-52">
                              <SelectValue placeholder="Associer à un champ..." />
                            </SelectTrigger>
                            <SelectContent>
                              {knownFields.map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mt-6">
                  <button className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 h-10 min-w-[96px]">
                    Cancel
                  </button>
                  <div className="flex-1">
                    <label htmlFor="format" className="block text-sm font-medium mb-1">Format du fichier</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="Sélectionner un format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      toast.error("Aucun fichier sélectionné.");
                      return;
                    }

                    const isCSV = file.name.endsWith(".csv");

                    if (isCSV) {
                      Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                          const parsedContacts = results.data as any[];
                          const headers = Object.keys(parsedContacts[0] || {});
                          if (headers.length < 2) {
                            toast.error("Le fichier doit contenir au moins deux colonnes.");
                            return;
                          }
                          const unknowns = headers.filter(h => !knownFields.includes(h));
                          setUnknownHeaders(unknowns);
                          setColumnMapping({});
                          setContacts(parsedContacts);
                          setShowPreview(true);
                          toast.success(`Fichier prêt : ${parsedContacts.length} contacts détectés`);
                        },
                      });
                    } else {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const data = new Uint8Array(event.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: "array" });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const parsedContacts = XLSX.utils.sheet_to_json(worksheet);
                        const headers = Object.keys(parsedContacts[0] || {});
                        if (headers.length < 2) {
                          toast.error("Le fichier doit contenir au moins deux colonnes.");
                          return;
                        }
                        const unknowns = headers.filter(h => !knownFields.includes(h));
                        setUnknownHeaders(unknowns);
                        setColumnMapping({});
                        setContacts(parsedContacts);
                        setShowPreview(true);
                        toast.success(`Fichier Excel prêt : ${parsedContacts.length} contacts détectés`);
                      };
                      reader.readAsArrayBuffer(file);
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex w-full justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Import your own media contacts</h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Sélectionner un fichier
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={!contacts.length || isLoading || selectedFormat === ""}
                      variant="default"
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Importer
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage all of your contacts within Briefly.<br />
                  You can always update them or upload more lists at any time.
                </p>
                <a
                  href="/contacts-import-100.csv"
                  download
                  className="text-sm text-primary hover:underline"
                >
                  📄 Télécharger un exemple de fichier CSV
                </a>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}