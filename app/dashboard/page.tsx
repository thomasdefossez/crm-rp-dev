import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
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
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Emails</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Envoyez des emails personnalisés pour engager vos destinataires et faire avancer les conversations.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Envoyer un email
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Veille</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Suivez la couverture médiatique de votre marque, vos concurrents et vos mots-clés stratégiques.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Accéder à la veille
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Créateur de communiqué</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Partagez une actualité marquante de votre marque pour attirer l’attention des médias.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Créer un communiqué
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Salle de presse</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Centralisez toutes vos actualités dans une salle de presse conviviale pour les journalistes.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Gérer la salle de presse
                </button>
              </div>
            </div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Contacts</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Organisez vos contacts dans un CRM RP pour mieux gérer vos relations.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Gérer les contacts
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Veille</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Suivez la couverture médiatique de votre marque, de vos concurrents et de vos mots-clés stratégiques.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Accéder à la veille
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-6 pt-4 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Rapports</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Présentez des données pertinentes grâce à des rapports interactifs et personnalisables.
                </p>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-violet-700 text-white shadow-sm hover:bg-violet-800 transition-transform transform hover:scale-105">
                  Créer un rapport
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-violet-700 text-white flex flex-col items-center justify-center text-center p-6 pt-4">
                <h2 className="text-lg font-semibold mb-2">Pour démarrer ?</h2>
                <p className="text-sm mb-4">Réservez un appel de démonstration gratuit</p>
                <div className="flex -space-x-2 justify-center mb-6">
                </div>
                <button className="w-full px-4 py-2 text-sm font-medium rounded-md bg-white text-violet-700 shadow-sm hover:bg-gray-100 transition-transform transform hover:scale-105">
                  Planifier une démo
                </button>
              </div>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}
