"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Bell, Mail, CreditCard, FileText, Wallet } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { ChevronRight } from "lucide-react";

const navItems = [
  {
    title: "Compte",
    url: "#",
    icon: User,
    isActive: true,
    items: [
      { title: "Informations", url: "#informations" },
      { title: "Sécurité", url: "#securite" },
      { title: "Notifications", url: "#notifications" },
      { title: "Préférences email", url: "#emails" },
    ],
  },
  {
    title: "Facturation",
    url: "#",
    icon: CreditCard,
    items: [
      { title: "Plans & Abonnements", url: "#plans" },
      { title: "Cartes", url: "#cartes" },
      { title: "Factures", url: "#factures" },
    ],
  },
  {
    title: "Paramètres des emails",
    url: "#",
    icon: Mail,
    items: [
      { title: "Comportement des emails", url: "#comportement" },
      { title: "Domaine des emails", url: "#domaine" },
      { title: "Envoi des emails", url: "#envoi" },
    ],
  },
];

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-full">
          <aside className="w-64 shrink-0">
            <NavMain items={navItems} />
          </aside>
          {activeSection === "#informations" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Informations sur le compte</h2>
                <p className="text-sm text-muted-foreground">Enregistré automatiquement</p>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700">Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">+</div>
                  <Button>Télécharger l’image</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Prénom</Label>
                  <Input placeholder="Thomas" />
                  <p className="text-xs text-muted-foreground">Seul votre prénom est visible aux utilisateurs.</p>
                </div>
                <div>
                  <Label>Nom de famille</Label>
                  <Input placeholder="Defossez" />
                  <p className="text-xs text-muted-foreground">Votre nom de famille reste privé.</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="tdefossez@opper.io" />
                  <p className="text-xs text-muted-foreground">Utilisé pour envoyer les notifications.</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input placeholder="+33600108182" />
                  <p className="text-xs text-muted-foreground">Utilisé pour la récupération et 2FA.</p>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#securite" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
              <p className="text-sm text-muted-foreground">Gérer les applications connectées à votre compte. Consulter l’historique des sessions.</p>

              <div>
                <h3 className="text-base font-medium text-gray-900">Applications autorisées</h3>
                <div className="border rounded-md overflow-hidden mt-2">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Agent utilisateur</th>
                        <th className="text-left p-2">Localisation</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">Safari (Mac OS)</td>
                          <td className="p-2">🇫🇷 France (2a04:cec0:f048:f9fc::)</td>
                          <td className="p-2 text-red-500 cursor-pointer">❌</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900">Historique des connexions récentes</h3>
                <div className="border rounded-md overflow-hidden mt-2">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Localisation</th>
                        <th className="text-left p-2">État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">5 Mai (12:30) de Safari (Mac OS)</td>
                          <td className="p-2">🇫🇷 France (2a04:cec0:f048:f9fc::)</td>
                          <td className="p-2 text-green-600 font-medium">Autorisé</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#notifications" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Choisissez comment vous souhaitez gérer vos notifications. Il n'est pas recommandé de les désactiver, car vous ne serez pas notifié lorsque vous recevrez un nouveau message.
              </p>

              <div className="flex items-center justify-between border-b pb-4">
                <span>Désactiver toutes les notifications</span>
                <input type="checkbox" className="h-4 w-4" />
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Notifications push</h3>
                <div className="flex items-center justify-between">
                  <span>Notifiez-moi des messages lorsque je suis en ligne</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Notifiez-moi des messages lorsque je suis hors-ligne</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Notifiez-moi quand un visiteur est sur mon site</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Jouer les sons de notification</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="text-base font-medium">Notifications par email</h3>
                <div className="flex items-center justify-between">
                  <span>Recevoir par email les messages non lus</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Recevoir par email les transcriptions des conversations</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Recevoir par email les notations utilisateur</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Recevoir par email les factures payées</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>
            </section>
          )}
          {activeSection === "#plans" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <h2 className="text-xl font-semibold text-gray-900">Plans & Abonnements</h2>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4">
                Vous n’avez ajouté aucune méthode de paiement. Ajoutez-en une pour souscrire à un abonnement.{" "}
                <a href="#" className="underline font-medium">Aller aux paramètres de paiement</a>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md p-4 flex items-center gap-4">
                <div className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold text-lg">€0.00</div>
                <div>
                  <div className="font-medium">Ce que vous payez mensuellement.</div>
                  <p className="text-sm">Les paiements sont effectués mensuellement ou annuellement selon vos options d’abonnement.</p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900">Gérer tous les abonnements de l’espace de travail</h3>
                <p className="text-sm text-muted-foreground mb-4">Gérer tous les abonnements sur vos espaces de travail.</p>

                <div className="border rounded-lg p-4 space-y-2 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 h-6 w-6 rounded-full"></div>
                      <span className="font-medium text-gray-900">opper</span>
                      <span className="bg-black text-white text-xs rounded px-2 py-0.5">ESSENTIALS</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">$95.00 <span className="text-sm font-normal text-gray-500">/mois</span></div>
                  <div className="text-sm flex items-center gap-2 text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span> Inactif
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="text-gray-500">👤</span> Propriétaire de la facture <span className="font-medium">aucun</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default">Changer de plan</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Choisir un plan</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { title: "Free", price: "€0", features: ["2 agents inclus", "100 profils", "Chat pour site", "Applications mobiles", "Connecteur e-commerce"], active: false },
                            { title: "Mini", price: "€45", features: ["4 agents", "5 000 profils", "CRM", "Messages proactifs", "Slack / Telegram"], active: false },
                            { title: "Essentials", price: "€95", features: ["10 agents", "50 000 profils", "IA", "Campagnes de mailing", "Réception omnicanale"], active: true },
                            { title: "Plus", price: "€295", features: ["20 agents", "200 000 profils", "IA avancée", "Assistant virtuel", "Transcription auto"], active: false },
                          ].map((plan) => (
                            <div key={plan.title} className={`rounded-lg border p-4 ${plan.active ? "border-primary" : "border-muted"} space-y-2`}>
                              <div className="text-lg font-semibold">{plan.title}</div>
                              <div className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal text-gray-500">/mois</span></div>
                              <ul className="text-sm space-y-1">
                                {plan.features.map((f) => (
                                  <li key={f} className="flex items-center gap-1">
                                    ✅ <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="border-red-500 text-red-600 hover:text-red-700">Mettre à jour le paiement</Button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#cartes" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <h2 className="text-xl font-semibold text-gray-900">Cartes</h2>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4">
                Aucune méthode de paiement. Ajoutez une méthode de paiement pour commencer à ajouter des abonnements à vos espaces de travail !
              </div>

              <p className="text-sm text-muted-foreground">
                Vous pouvez annuler ou souscrire quand vous le souhaitez. Sans engagement. <br />
                <span className="underline">Une méthode de paiement peut être liée à plusieurs espaces de travail</span> (ex. si vous avez des espaces de travail pour plusieurs entreprises)
              </p>

              <div className="flex gap-4">
                <Button variant="outline">Toutes les factures</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default">Ajouter un moyen de paiement</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouveau moyen de paiement</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                      La méthode de paiement ajoutée sera rattachée automatiquement à vos espaces de travail sans méthode de paiement valide.
                    </p>

                    <div className="space-y-4">
                      <div className="border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted">
                        <div className="font-medium">Configurer une carte bancaire</div>
                        <div className="text-sm text-muted-foreground">Tous les prestataires de cartes de crédit sont pris en charge.</div>
                      </div>
                      <div className="border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted">
                        <div className="font-medium">Configurer PayPal</div>
                        <div className="text-sm text-muted-foreground">Supporte les cartes de paiement et les comptes bancaires.</div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Si vous avez un essai actif d’un plan payant qui expire, ce moyen de paiement sera utilisé pour renouveler automatiquement votre abonnement payant.
                    </p>
                    <a href="#" className="text-xs underline text-muted-foreground">En savoir plus</a>
                  </DialogContent>
                </Dialog>
              </div>
            </section>
          )}
          {activeSection === "#comportement" && (
            <section className="flex-1 bg-white p-6 rounded-xl shadow space-y-8 text-gray-700">
              <h2 className="text-3xl font-semibold text-gray-900">Comportement des emails</h2>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4">
                Cet espace de travail n'est lié à aucune méthode de paiement. Liez-en une pour conserver vos abonnements.
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Options générales</h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span>Envoyer les transcriptions de conversation aux utilisateurs par email</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Activer les évaluations (dans la chatbox et les transcriptions)</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enrichir le profil des contacts avec l'email (ex. nom et avatar)</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Envoyer les emails qui pourraient être indésirables vers la boîte de spams</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Signature des emails</h3>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex flex-col">
                      <span>Afficher une signature texte à la fin de tous les emails</span>
                      <span className="text-xs text-orange-500">inactif</span>
                    </span>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
