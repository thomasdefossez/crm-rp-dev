"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
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
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
  const [userData, setUserData] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  // États pour les champs modifiables
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  // Notifications preferences states
  const [notificationsDisabled, setNotificationsDisabled] = useState(false);
  const [notifPushOnline, setNotifPushOnline] = useState(true);
  const [notifPushOffline, setNotifPushOffline] = useState(true);
  const [notifPushVisitor, setNotifPushVisitor] = useState(false);
  const [notifSoundEnabled, setNotifSoundEnabled] = useState(true);
  const [notifEmailUnreadMessages, setNotifEmailUnreadMessages] = useState(true);
  const [notifEmailTranscripts, setNotifEmailTranscripts] = useState(false);
  const [notifEmailRatings, setNotifEmailRatings] = useState(true);
  const [notifEmailBilling, setNotifEmailBilling] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Erreur auth:", authError);
        return;
      }

      // Vérifie si la ligne utilisateur existe, sinon la créer
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
        });

        if (insertError) {
          console.error("Erreur lors de la création de l'utilisateur :", insertError);
          toast.error("Erreur lors de l'initialisation de l'utilisateur.");
          return;
        }
      }

      // Ajout du contrôle de nullité pour user avant la requête utilisateur
      if (!user) {
        toast.error("Utilisateur non authentifié.");
        return;
      }

      const { data, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);

      console.log("Résultat brut Supabase:", data, userError);

      if (!data || data.length === 0) {
        console.warn("Aucune donnée utilisateur trouvée pour l'ID:", user.id, "et email:", user.email);
        toast.error("Aucune donnée utilisateur trouvée.");
        return;
      }

      const userData = data[0];

      setFirstname(userData.first_name || "");
      setLastname(userData.last_name || "");
      setPhone(userData.phone || "");
      setUserData(userData);
      setNotificationsDisabled(userData.notifications_disabled ?? false);
      setNotifPushOnline(userData.notif_push_online ?? true);
      setNotifPushOffline(userData.notif_push_offline ?? true);
      setNotifPushVisitor(userData.notif_push_visitor ?? false);
      setNotifSoundEnabled(userData.notif_sound_enabled ?? true);
      setNotifEmailUnreadMessages(userData.notif_email_unread_messages ?? true);
      setNotifEmailTranscripts(userData.notif_email_transcripts ?? false);
      setNotifEmailRatings(userData.notif_email_ratings ?? true);
      setNotifEmailBilling(userData.notif_email_billing ?? true);
    };

    fetchUserData();
  }, []);

  // Fonction pour ouvrir le portail Stripe
  async function handleOpenStripePortal() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Utilisateur non authentifié.");
        return;
      }

      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.error || "Erreur lors de la connexion à Stripe.");
        return;
      }

      const data = await response.json();
      if (data.url) {
        toast.success("Redirection vers Stripe...");
        window.location.href = data.url;
      } else {
        toast.error("URL de redirection manquante.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du portail Stripe :", error);
      toast.error("Erreur lors de l'ouverture du portail Stripe.");
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col gap-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Paramètres</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Compte</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Compte</h1>
            </div>
          </div>
        </div>
        <div className="flex h-full">
          <aside className="w-64 shrink-0">
            <NavMain items={navItems} />
          </aside>
          {!activeSection && (
            <section className="flex-1 p-6 text-gray-700 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Invitez votre équipe</h3>
                  <p className="text-sm text-muted-foreground mb-4">Invitez vos collègues à rejoindre votre espace de travail. Collaborez de manière transparente et gérez efficacement les conversations ensemble.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="flex -space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 z-10" />
                      ))}
                    </div>
                    <div className="ml-auto text-gray-500">•••</div>
                  </div>
                  <Button>Ajouter des opérateurs →</Button>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Valorisez votre marque avec un logo personnalisé</h3>
                  <p className="text-sm text-muted-foreground mb-4">Votre logo est le symbole de l’identité de votre marque. Téléchargez-le pour que votre chatbox soit immédiatement reconnaissable.</p>
                  <div className="bg-gray-100 h-24 rounded-md mb-4 flex items-center justify-center text-gray-400">[Logo]</div>
                  <Button variant="outline">Téléchargez votre logo →</Button>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Ajoutez votre avatar</h3>
                  <p className="text-sm text-muted-foreground mb-4">Ajoutez une touche personnelle à votre profil avec un avatar qui vous représente.</p>
                  <div className="bg-gray-50 border rounded-md p-4 text-sm text-gray-700 mb-4">
                    <p><strong>Beth from Crisp</strong><br />Feel free to book a demo with us</p>
                  </div>
                  <Button variant="outline">Téléchargez votre avatar →</Button>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm col-span-1 md:col-span-2 xl:col-span-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Ajustez le design de votre site Chatbox</h3>
                  <p className="text-sm text-muted-foreground mb-4">Personnalisez l’aspect de votre chatbox pour créer une expérience utilisateur homogène.</p>
                  <div className="bg-gray-100 h-24 rounded-md mb-4 flex items-center justify-center text-gray-400">[Thèmes Chatbox]</div>
                  <Button>Personnaliser Chatbox →</Button>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#informations" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Informations sur le compte</h2>
                  <p className="text-xs text-muted-foreground">Enregistré automatiquement</p>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">Avatar (URL)</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        "+"
                      )}
                    </div>
                    <Input
                      placeholder="https://..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Seul votre prénom est visible aux utilisateurs.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nom de famille</Label>
                    <Input value={lastname} onChange={(e) => setLastname(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Votre nom de famille reste privé.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="tdefossez@opper.io" value={userData?.email || ""} readOnly />
                    <p className="text-xs text-muted-foreground">Utilisé pour envoyer les notifications.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Utilisé pour la récupération et 2FA.</p>
                  </div>
                </div>

                {/* Example: Ajout d'un bouton Enregistrer pour la démo */}
                <div className="mt-6">
                  <Button
                    onClick={async () => {
                      const {
                        data: { user },
                      } = await supabase.auth.getUser();

                      if (!user) {
                        toast.error("Utilisateur non authentifié.");
                        return;
                      }

                      const { error } = await supabase
                        .from("users")
                        .update({
                          first_name: firstname,
                          last_name: lastname,
                          phone,
                        })
                        .eq("id", user.id);

                      if (error) {
                        toast.error("Erreur lors de la mise à jour.");
                      } else {
                        toast.success("Informations mises à jour avec succès !");
                      }
                    }}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#securite" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                <h2 className="text-2xl font-semibold tracking-tight">Sécurité</h2>
                <p className="text-xs text-muted-foreground">Gérer les applications connectées à votre compte. Consulter l’historique des sessions.</p>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Applications autorisées</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900">Historique des connexions récentes</h3>
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
              </div>
            </section>
          )}
          {activeSection === "#notifications" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground text-sm">
                  Choisissez comment vous souhaitez gérer vos notifications. Il n'est pas recommandé de les désactiver, car vous ne serez pas notifié lorsque vous recevrez un nouveau message.
                </p>

                <div className="flex items-center justify-between border-b pb-4">
                  <span>Désactiver toutes les notifications</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={notificationsDisabled}
                    onChange={(e) => setNotificationsDisabled(e.target.checked)}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications push</h3>
                  <div className="flex items-center justify-between">
                    <span>Notifiez-moi des messages lorsque je suis en ligne</span>
                    <input
                      type="checkbox"
                      checked={notifPushOnline}
                      onChange={(e) => setNotifPushOnline(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notifiez-moi des messages lorsque je suis hors-ligne</span>
                    <input
                      type="checkbox"
                      checked={notifPushOffline}
                      onChange={(e) => setNotifPushOffline(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Notifiez-moi quand un visiteur est sur mon site</span>
                    <input
                      type="checkbox"
                      checked={notifPushVisitor}
                      onChange={(e) => setNotifPushVisitor(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jouer les sons de notification</span>
                    <input
                      type="checkbox"
                      checked={notifSoundEnabled}
                      onChange={(e) => setNotifSoundEnabled(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications par email</h3>
                  <div className="flex items-center justify-between">
                    <span>Recevoir par email les messages non lus</span>
                    <input
                      type="checkbox"
                      checked={notifEmailUnreadMessages}
                      onChange={(e) => setNotifEmailUnreadMessages(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Recevoir par email les transcriptions des conversations</span>
                    <input
                      type="checkbox"
                      checked={notifEmailTranscripts}
                      onChange={(e) => setNotifEmailTranscripts(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recevoir par email les notations utilisateur</span>
                    <input
                      type="checkbox"
                      checked={notifEmailRatings}
                      onChange={(e) => setNotifEmailRatings(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recevoir par email les factures payées</span>
                    <input
                      type="checkbox"
                      checked={notifEmailBilling}
                      onChange={(e) => setNotifEmailBilling(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={async () => {
                      const {
                        data: { user },
                      } = await supabase.auth.getUser();

                      if (!user) {
                        toast.error("Utilisateur non authentifié.");
                        return;
                      }

                      const { error } = await supabase.from("users").update({
                        notifications_disabled: notificationsDisabled,
                        notif_push_online: notifPushOnline,
                        notif_push_offline: notifPushOffline,
                        notif_push_visitor: notifPushVisitor,
                        notif_sound_enabled: notifSoundEnabled,
                        notif_email_unread_messages: notifEmailUnreadMessages,
                        notif_email_transcripts: notifEmailTranscripts,
                        notif_email_ratings: notifEmailRatings,
                        notif_email_billing: notifEmailBilling,
                      }).eq("id", user.id);

                      if (error) {
                        toast.error("Erreur lors de la mise à jour des préférences.");
                      } else {
                        toast.success("Préférences mises à jour !");
                      }
                    }}
                  >
                    Enregistrer mes préférences
                  </Button>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#plans" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold tracking-tight">Plans & Abonnements</h2>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4 mt-6">
                  Vous n’avez ajouté aucune méthode de paiement. Ajoutez-en une pour souscrire à un abonnement.{" "}
                  <button
                    onClick={handleOpenStripePortal}
                    className="underline font-medium text-sm"
                  >
                    Aller aux paramètres de paiement
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md p-4 flex items-center gap-4 mt-6">
                  <div className="bg-blue-600 text-white rounded-md px-4 py-2 font-semibold text-lg">€0.00</div>
                  <div>
                    <div className="font-medium">Ce que vous payez mensuellement.</div>
                    <p className="text-sm">Les paiements sont effectués mensuellement ou annuellement selon vos options d’abonnement.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Gérer tous les abonnements de l’espace de travail</h3>
                  <p className="text-muted-foreground text-sm mb-4">Gérer tous les abonnements sur vos espaces de travail.</p>

                  <div className="border rounded-lg p-6 space-y-4 bg-muted/10">
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
                    <div className="flex gap-4 pt-4">
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
              </div>
            </section>
          )}
          {activeSection === "#cartes" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Cartes</h2>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4 mt-4">
                  Aucune méthode de paiement. Ajoutez une méthode de paiement pour commencer à ajouter des abonnements à vos espaces de travail !
                </div>

                <p className="text-muted-foreground text-sm mt-2">
                  Vous pouvez annuler ou souscrire quand vous le souhaitez. Sans engagement. <br />
                  <span className="underline">Une méthode de paiement peut être liée à plusieurs espaces de travail</span> (ex. si vous avez des espaces de travail pour plusieurs entreprises)
                </p>

                <div className="flex gap-4 mt-4">
                  <Button variant="outline">Toutes les factures</Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default">Ajouter un moyen de paiement</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl space-y-6">
                      <DialogHeader>
                        <DialogTitle>Ajouter un nouveau moyen de paiement</DialogTitle>
                      </DialogHeader>

                      <p className="text-muted-foreground text-sm">
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
              </div>
            </section>
          )}
          {activeSection === "#domaine" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">Domaine des emails</h2>
                  <div className="text-sm px-3 py-1 bg-muted rounded-md text-green-700 border border-green-200">
                    ✅ Enregistré automatiquement
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4">
                  Cet espace de travail n'est lié à aucune méthode de paiement. Liez-en une pour conserver vos abonnements.
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Domaine email personnalisé</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">Domaine basique *</Label>
                      <div className="flex">
                        <Input defaultValue="opper-1sluywd" className="rounded-r-none" />
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input text-sm bg-muted text-muted-foreground">
                          .on.crisp.email
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-1 block">Domaine personnalisé</Label>
                      <Input placeholder="emails.monsite.fr" />
                    </div>
                  </div>

                  <div className="rounded-md border text-sm text-muted-foreground bg-muted px-4 py-3 flex items-center gap-2">
                    <span>✅</span> Ce domaine ne requiert aucune configuration (domaine Crisp par défaut).
                  </div>

                  <p className="text-green-700 text-sm italic">Ce domaine est actif sur votre espace de travail.</p>

                  <Button variant="secondary" disabled className="opacity-70">
                    ✅ Vérifier le domaine
                  </Button>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#envoi" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700 text-sm">
              <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">Envoi des emails</h2>
                  <div className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-md text-green-700 border border-green-200">
                    ✅ Enregistré automatiquement
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4 mt-6">
                  Cet espace de travail n'est lié à aucune méthode de paiement. Liez-en une pour conserver vos abonnements.
                </div>

                <div className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">IPs d'envoi d'emails</h3>
                    <div className="border rounded-md bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
                      <p className="font-medium text-gray-800">❔ Que sont les IPs d'envoi d'emails ?</p>
                      <p>
                        Lorsque des emails sont envoyés à vos utilisateurs pour vos messages et campagnes Crisp,
                        une adresse IP de serveur SMTP d'envoi est utilisée. Cette IP a une réputation plus ou moins bonne.
                        Les chances qu'un email soit reçu en tant que spam dépendent de la réputation de l'IP utilisée.
                      </p>
                      <p>Vous pouvez soit utiliser les IPs partagées (par défaut), ou obtenir votre adresse IP dédiée pour améliorer vos envois.</p>
                    </div>
                  </div>

                  <div>
                    <div className="border rounded-md p-4 space-y-2 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-700">💡 Statut de votre IP d'envoi d'emails</div>
                        <div className="text-orange-600 font-semibold text-sm">Moyen</div>
                      </div>
                      <p className="">Vous utilisez une IP partagée</p>
                      <Button variant="outline" size="sm">Installer le plugin IP email dédiée</Button>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">Moyen</span>
                        Bloc moyenne réputation en utilisation
                        <a href="#" className="text-blue-600 underline">pourquoi ?</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t mt-6">
                  <h3 className="text-lg font-semibold mb-2">Serveur SMTP personnalisé</h3>
                  <div className="flex items-center justify-between text-muted-foreground text-sm pt-2">
                    <p>Envoyer tous les emails via mon serveur SMTP personnalisé</p>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 text-xs">● inactif</span>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeSection === "#comportement" && (
            <section className="flex-1 p-6 space-y-8 text-gray-700">
              <div className="bg-white rounded-lg shadow-sm p-6 text-sm">
                <h2 className="text-2xl font-semibold tracking-tight">Comportement des emails</h2>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-4 mt-6">
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
              </div>
            </section>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
