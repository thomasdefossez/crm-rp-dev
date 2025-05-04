"use client"

import { useState, Fragment } from "react"
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
import { DataTable } from "@/components/ui/data-table/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Package, ShoppingCart, Store, Truck } from "lucide-react"
import SendTestEmailDialog from "@/app/emails/SendTestEmailDialog";

export default function Page() {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [emailBody, setEmailBody] = useState('');
  const hasBodyError = emailBody.replace('[unsubscribe]', '').trim() === '';
  const hasUnsubscribeLink = emailBody.includes('[unsubscribe]');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false);

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

        <div className="mt-8 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {[
                { label: "Rédaction", icon: Store },
                { label: "Destinataires", icon: Truck },
                { label: "Envoi", icon: ShoppingCart },
              ].map((step, index, arr) => (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    {index + 1 === currentStep ? (
                      <BreadcrumbPage className="flex items-center gap-2 font-medium text-purple-600">
                        <step.icon className="h-5 w-5" />
                        {step.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                        <step.icon className="h-5 w-5" />
                        {step.label}
                      </BreadcrumbLink>
                    )}
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
          </Breadcrumb>
        </div>

        <div className="p-4">
          <div className="flex gap-8">
            {/* Colonne gauche */}
            <div className="flex-1 border rounded-md p-6 bg-white">
              <div className="flex gap-4 mb-4">
                <button className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50">
                  Ajouter des tokens de personnalisation
                </button>
                <button className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50">
                  Ajouter une pièce jointe
                </button>
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
                <button
                  className="text-sm text-gray-900 hover:underline"
                  onClick={() => {
                    if (!hasUnsubscribeLink) {
                      setEmailBody((prev) => prev + '\n\n[unsubscribe]');
                    }
                  }}
                >
                  Ajouter le lien de désinscription
                </button>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="w-[300px] bg-white">
              <div className="mb-6 flex gap-3">
                <button
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={hasBodyError || !hasUnsubscribeLink}
                  onClick={() => setIsSendTestDialogOpen(true)}
                >
                  Envoyer un email
                </button>
                <SendTestEmailDialog
                  open={isSendTestDialogOpen}
                  onOpenChange={setIsSendTestDialogOpen}
                  emailBody={emailBody}
                />
                <button
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    hasBodyError || !hasUnsubscribeLink
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  disabled={hasBodyError || !hasUnsubscribeLink}
                >
                  Suivant
                </button>
              </div>
              <h2 className="text-lg font-bold mb-4">Améliorez votre contenu</h2>
              <div className="space-y-4 text-sm">
                {hasBodyError && (
                  <div className="border border-red-500 rounded-md p-4 text-red-600">
                    <div className="font-semibold mb-1">1 erreur</div>
                    <div>Le corps de l'email est vide</div>
                  </div>
                )}
                {!hasUnsubscribeLink && (
                  <div className="border border-red-500 rounded-md p-4 text-red-600">
                    Lien de désinscription manquant
                  </div>
                )}
                <div className="border border-green-300 rounded-md p-4 text-green-600">
                  <div className="font-semibold mb-1">Mots déclencheurs de spam</div>
                  <div>Aucun détecté</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}