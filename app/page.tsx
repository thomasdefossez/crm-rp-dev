"use client";

import { useState } from 'react';

const roadmap = [
  {
    phase: 'PHASE 0',
    titre: 'Setup de base',
    objectif: 'Avoir l’ossature technique prête',
    progress: 100,
    livrables: [
      'Authentification avec Supabase Auth',
      'Frontend React / Next.js avec Tailwind CSS',
      'Supabase branché en base relationnelle',
      'Structure projet front-end / back-end',
    ],
  },
  {
    phase: 'PHASE 1',
    titre: 'Noyau produit',
    objectif: 'Gérer un compte utilisateur et une base de contacts',
    progress: 40,
    livrables: [
      'Page profil utilisateur',
      'Structure des rôles / plans',
      'Connexion UID Supabase <> base utilisateur',
    ],
  },
  {
    phase: 'PHASE 2',
    titre: 'Gestion des contacts RP',
    objectif: 'Créer et gérer sa base journalistes',
    progress: 30,
    livrables: [
      'Table contacts',
      'Formulaire création + édition',
      'Import CSV',
      'Tagging / filtre / recherche',
    ],
  },
  {
    phase: 'PHASE 3',
    titre: 'Communiqués de presse',
    objectif: 'Rédiger, envoyer, tracker un communiqué',
    progress: 10,
    livrables: [
      'Éditeur WYSIWYG',
      'Choix des contacts à cibler',
      'Suivi des envois',
      'Email via Resend',
    ],
  },
  {
    phase: 'PHASE 4',
    titre: 'Monétisation & Abonnements',
    objectif: 'Activer les plans payants et gérer le paiement',
    progress: 0,
    livrables: [
      'Intégration Stripe checkout',
      'Webhooks user_subscriptions',
      'Page pricing + upgrade/downgrade',
      'Verrouillage fonctions selon plan',
    ],
  },
  {
    phase: 'PHASE 5',
    titre: 'Newsroom publique',
    objectif: 'Créer une page publique de communiqués',
    progress: 0,
    livrables: [
      'Page “/newsroom/nom-du-client”',
      'Liste des communiqués publiés',
      'SEO et design simple',
    ],
  },
  {
    phase: 'PHASE 6',
    titre: 'Améliorations et IA',
    objectif: 'Ajouter un petit effet “wahou”',
    progress: 0,
    livrables: [
      'Résumé automatique d’un communiqué (GPT)',
      'Suggestion de journalistes',
      'Dashboard statistique',
    ],
  },
];

export default function Home() {
  const [openPhase, setOpenPhase] = useState<string | null>(roadmap[0].phase);

  return (
      <main className="p-8 bg-background min-h-screen text-foreground">
        <h1 className="text-2xl font-semibold tracking-tight mb-10">
          Projet CRM RP – Vue d’ensemble
        </h1>

        <div className="mb-8 flex flex-wrap gap-4">
          <a
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            Accéder à Briefly
          </a>
          <a
              href="https://landing.rp.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            Accéder à la landing
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stack technique */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-base font-semibold mb-4">Stack technique</h2>
            <table className="w-full text-left text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Élément</th>
                <th className="p-3 border-b">Technologie</th>
                <th className="p-3 border-b">Notes</th>
              </tr>
              </thead>
              <tbody>
              {[
                {
                  name: "Frontend",
                  tech: "Next.js",
                  logo: "/logos/nextjs.svg",
                  notes: "Pages en `/app`, SSR et RSC activés",
                },
                {
                  name: "UI",
                  tech: "Tailwind CSS",
                  logo: "/logos/tailwindcss.svg",
                  notes: "Design inspiré ShadCN, sans dépendance UI",
                },
                {
                  name: "Auth",
                  tech: "Supabase Auth",
                  logo: "/logos/supabase.svg",
                  notes: "Emails intégrés pour login/signup/reset",
                },
                {
                  name: "Base de données",
                  tech: "Supabase (PostgreSQL)",
                  logo: "/logos/postgresql.svg",
                  notes: "Relationnelle, branchée aux utilisateurs",
                },
                {
                  name: "Paiement",
                  tech: "Stripe",
                  logo: "/logos/stripe.svg",
                  notes: "Plans payants avec abonnement & webhooks",
                },
                {
                  name: "Emails transactionnels",
                  tech: "Resend",
                  logo: "/logos/resend.svg",
                  notes: "Pour l’envoi de communiqués – 3000 mails/mois gratuits",
                },
                {
                  name: "Infrastructure",
                  tech: "Pulumi + AWS",
                  logo: "/logos/pulumi.svg",
                  notes: "Déploiement infra-as-code",
                },
              ].map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{item.name}</td>
                    <td className="p-3 border-b">
                      <div className="flex items-center gap-2">
                        <img src={item.logo} alt={item.tech} className="h-5 w-5" />
                        {item.tech}
                      </div>
                    </td>
                    <td className="p-3 border-b">{item.notes}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </section>

          {/* Roadmap */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-base font-semibold mb-4">Roadmap produit</h2>
            <div className="space-y-4">
              {roadmap.map((phase) => {
                const status =
                    phase.progress === 100
                        ? '✅ Terminé'
                        : phase.progress > 0
                            ? '🟣 En cours'
                            : '⏳ À venir';

                return (
                    <div key={phase.phase} className="bg-muted/50 border rounded-lg shadow-sm">
                      <button
                          onClick={() => setOpenPhase(openPhase === phase.phase ? null : phase.phase)}
                          className="w-full text-left p-4 hover:bg-muted flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs uppercase text-muted">{phase.phase}</p>
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            {phase.titre}
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    phase.progress === 100
                                        ? 'bg-green-200 text-green-800'
                                        : phase.progress > 0
                                            ? 'bg-purple-200 text-purple-800'
                                            : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                          {status}
                        </span>
                          </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                      {openPhase === phase.phase ? '▲' : '▼'}
                    </span>
                      </button>

                      {openPhase === phase.phase && (
                          <div className="px-4 pb-4">
                            <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
                              <div
                                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                                  style={{ width: `${phase.progress}%` }}
                              />
                            </div>
                            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                              {phase.livrables.map((item, i) => (
                                  <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
  );
}