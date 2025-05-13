"use client";

import { useState } from 'react';
import { CheckCircle, LoaderCircle, Clock, LogIn, Mail, ShieldCheck, Github, Server } from "lucide-react";

const roadmap = [
  {
    phase: 'PHASE 0',
    titre: 'Setup de base',
    objectif: 'Avoir l’ossature technique prête',
    progress: 100,
    livrables: [
      'Authentification avec Supabase Auth ✅',
      'Frontend React / Next.js avec Tailwind CSS ✅',
      'Supabase branché en base relationnelle ✅',
      'Structure projet front-end / back-end ✅',
    ],
  },
  {
    phase: 'PHASE 1',
    titre: 'Noyau produit',
    objectif: 'Gérer un compte utilisateur et une base de contacts',
    progress: 40,
    livrables: [
      'Page profil utilisateur 🟣',
      'Structure des rôles / plans ⏳',
      'Connexion UID Supabase <> base utilisateur ⏳',
    ],
  },
  {
    phase: 'PHASE 2',
    titre: 'Gestion des contacts RP',
    objectif: 'Créer et gérer sa base journalistes',
    progress: 75,
    livrables: [
      'Table contacts ✅',
      'Formulaire création + édition ✅',
      'Import CSV ⏳',
      'Tagging / filtre / recherche 🟣',
    ],
  },
  {
    phase: 'PHASE 2B',
    titre: 'Gestion des événements',
    objectif: 'Organiser et suivre les déjeuners presse & événements',
    progress: 90,
    livrables: [
      'Création événements 🟣',
      'Invitation de contacts 🟣',
      'Suivi des confirmations ⏳',
    ],
  },
  {
    phase: 'PHASE 3',
    titre: 'Communiqués de presse',
    objectif: 'Rédiger, envoyer, tracker un communiqué',
    progress: 10,
    livrables: [
      'Éditeur WYSIWYG ⏳',
      'Choix des contacts à cibler ⏳',
      'Suivi des envois ⏳',
      'Email via Resend 🟣',
    ],
  },
  {
    phase: 'PHASE 3B',
    titre: 'Campagnes & Mails',
    objectif: 'Préparer, envoyer et suivre des campagnes d’emailing RP',
    progress: 85,
    livrables: [
      'Création de campagnes 🟣',
      'Intégration Maily ✅',
      'Envoi des emails avec Resend ✅',
      'Tracking ouverture / clics ⏳',
    ],
  },
  {
    phase: 'PHASE 4',
    titre: 'Monétisation & Abonnements',
    objectif: 'Activer les plans payants et gérer le paiement',
    progress: 0,
    livrables: [
      'Intégration Stripe checkout ⏳',
      'Webhooks user_subscriptions ⏳',
      'Page pricing + upgrade/downgrade ⏳',
      'Verrouillage fonctions selon plan ⏳',
    ],
  },
  {
    phase: 'PHASE 5',
    titre: 'Newsroom publique',
    objectif: 'Créer une page publique de communiqués',
    progress: 0,
    livrables: [
      'Page “/newsroom/nom-du-client” ⏳',
      'Liste des communiqués publiés ⏳',
      'SEO et design simple ⏳',
    ],
  },
  {
    phase: 'PHASE 6',
    titre: 'Améliorations et IA',
    objectif: 'Ajouter un petit effet “wahou”',
    progress: 0,
    livrables: [
      'Résumé automatique d’un communiqué (GPT) ⏳',
      'Suggestion de journalistes ⏳',
      'Dashboard statistique ⏳',
    ],
  },
  {
    phase: 'PHASE 7',
    titre: 'Gestion des prêts',
    objectif: 'Gérer l’envoi et le retour des produits en prêt',
    progress: 0,
    livrables: [
      'Table des prêts ⏳',
      'Historique des envois/retours ⏳',
      'Suivi des statuts ⏳',
    ],
  },
];

const stack = [
  {
    name: "CI/CD",
    tech: "GitHub + GitHub Actions",
    logo: "https://cdn.simpleicons.org/github",
    notes: "Automatisation des tests, builds et déploiements",
  },
  {
    name: "Frontend deployment",
    tech: "Vercel",
    logo: "https://cdn.simpleicons.org/vercel",
    notes: "Déploiement du frontend Next.js avec SSR/RSC",
  },
  {
    name: "Reporting",
    tech: "Supabase Studio",
    logo: "https://cdn.simpleicons.org/supabase",
    notes: "Pour du reporting custom sur ta base",
  },
  {
    name: "Stockage fichiers",
    tech: "Supabase Storage",
    logo: "/logos/supabase.svg",
    notes: "Pour stocker les fichiers liés aux communiqués (PDF, images)",
  },
  {
    name: "Support client",
    tech: "Crisp",
    logo: "https://cdn.simpleicons.org/crisp",
    notes: "Pour le support client en live chat",
  },
  {
    name: "Monitoring",
    tech: "Sentry",
    logo: "https://cdn.simpleicons.org/sentry",
    notes: "Pour le monitoring des erreurs de l'application",
  },
  {
    name: "Frontend",
    tech: "Next.js",
    logo: "https://cdn.simpleicons.org/nextdotjs",
    notes: "Pages en `/app`, SSR et RSC activés",
  },
  {
    name: "UI",
    tech: "Tailwind CSS",
    logo: "https://cdn.simpleicons.org/tailwindcss",
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
    logo: "https://cdn.simpleicons.org/postgresql",
    notes: "Relationnelle, branchée aux utilisateurs",
  },
  {
    name: "Paiement",
    tech: "Stripe",
    logo: "https://cdn.simpleicons.org/stripe",
    notes: "Plans payants avec abonnement & webhooks",
  },
  {
    name: "Emails transactionnels",
    tech: "Resend",
    logo: "https://avatars.githubusercontent.com/u/108968288?s=200&v=4",
    notes: "Pour l’envoi de communiqués – 3000 mails/mois gratuits",
  },
  {
    name: "Infrastructure",
    tech: "Pulumi + AWS",
    logo: "https://cdn.simpleicons.org/amazonaws",
    notes: "Déploiement infra-as-code",
  },
];

export default function Home() {
  return (
      <main className="p-8 bg-background min-h-screen text-foreground">
        <div className="mb-8 flex flex-wrap gap-4">
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login Briefly
          </a>
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Mail className="h-4 w-4 mr-2" />
            Resend Dashboard
          </a>
          <a
            href="https://supabase.com/dashboard/sign-in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Supabase Dashboard
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </a>
          <a
            href="https://vercel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium shadow-sm hover:bg-violet-700 transition-colors"
          >
            <Server className="h-4 w-4 mr-2" />
            Vercel
          </a>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-12">
          🚀 Projet CRM RP – Vue d’ensemble
        </h1>

        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">🛠️ Stack technique</h2>
            <table className="w-full text-left text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Élément</th>
                <th className="p-3 border-b">Technologie</th>
                <th className="p-3 border-b">Notes</th>
              </tr>
              </thead>
              <tbody>
              {stack.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border-b font-medium text-gray-700">{item.name}</td>
                    <td className="p-3 border-b">
                      <div className="flex items-center gap-2">
                        <img src={item.logo} alt={item.tech} className="h-5 w-5" />
                        {item.tech}
                      </div>
                    </td>
                    <td className="p-3 border-b text-gray-600">{item.notes}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">📍 Roadmap produit</h2>
            <div className="space-y-6">
              {roadmap.map((phase) => {
                const status =
                    phase.progress === 100 ? 'Terminé' : phase.progress > 0 ? 'En cours' : 'À venir';
                const statusColor =
                    phase.progress === 100
                        ? 'bg-green-100 text-green-800'
                        : phase.progress > 0
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600';
                return (
                    <div key={phase.phase} className="border rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase text-gray-500">{phase.phase}</p>
                          <h3 className="text-lg font-semibold text-gray-800">{phase.titre}</h3>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>{status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 italic">{phase.objectif}</p>
                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <ul className="space-y-2">
                        {phase.livrables.map((item, i) => {
                          let Icon;
                          if (item.endsWith('✅')) Icon = CheckCircle;
                          else if (item.endsWith('🟣')) Icon = LoaderCircle;
                          else Icon = Clock;
                          const label = item.replace(/(✅|🟣|⏳)/, '').trim();
                          return (
                              <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                <Icon className="w-4 h-4 text-violet-600" />
                                {label}
                              </li>
                          );
                        })}
                      </ul>
                    </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
  );
}
