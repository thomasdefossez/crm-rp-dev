"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";
import Link from "next/link";
import {
    Compass,
    Monitor,
    FileText,
    Newspaper,
    Mail,
    Users,
    BarChart,
    LineChart,
    TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                toast.error("Accès refusé", {
                    description: "Tu dois être connecté pour accéder au dashboard.",
                });
                router.push("/login");
            } else {
                setUser(data.session.user);
                setLoading(false);
            }
        };

        checkSession();
    }, [router]);

    const cards = [
        {
            title: "Media database",
            description: "Find relevant journalists in our media database.",
            cta: "Find media contacts",
            icon: Compass,
            href: "/contacts",
        },
        {
            title: "Monitoring",
            description: "Track media coverage of your brand.",
            cta: "Monitor media",
            icon: Monitor,
            href: "/monitoring",
        },
        {
            title: "Press release creator",
            description: "Create engaging press releases.",
            cta: "Create press release",
            icon: FileText,
            href: "/press",
        },
        {
            title: "Newsroom",
            description: "Manage your online pressroom.",
            cta: "Manage newsroom",
            icon: Newspaper,
            href: "/newsroom",
        },
        {
            title: "Emails",
            description: "Send personalized PR emails.",
            cta: "Send email",
            icon: Mail,
            href: "/emails",
        },
        {
            title: "Contacts",
            description: "Organize and manage journalists.",
            cta: "Manage contacts",
            icon: Users,
            href: "/contacts",
        },
        {
            title: "Reporting",
            description: "Create customizable coverage reports.",
            cta: "Create report",
            icon: BarChart,
            href: "/reporting",
        },
        {
            title: "Statistics overview",
            description: "Track visits, views, clicks and more.",
            cta: "Track statistics",
            icon: LineChart,
            href: "/stats",
        },
        {
            title: "Analytics",
            description: "Review your overall PR performance.",
            cta: "Upgrade now",
            icon: TrendingUp,
            href: "/upgrade",
        },
    ];

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
                <p className="text-sm text-gray-500">Chargement…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-7xl mx-auto">
                {/* Bienvenue */}
                <div className="text-center mb-12 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm text-gray-500">
                            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                        </p>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome, {user?.user_metadata?.first_name || user?.email}!
                        <span className="animate-wiggle">👋</span>
                    </h1>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-center mb-4">
                                <card.icon className="w-8 h-8 text-gray-500" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-800 mb-1">
                                {card.title}
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">{card.description}</p>
                            <Link
                                href={card.href}
                                className="inline-block text-sm font-medium text-violet-600 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition"
                            >
                                {card.cta}
                            </Link>
                        </div>
                    ))}

                    {/* Nouvelle carte fixe "Schedule a demo" */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition flex flex-col items-center justify-between col-span-1 sm:col-span-2 lg:col-span-2">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-violet-600 mb-1">Need help getting started?</h2>
                            <p className="text-sm text-gray-500">Book a free demo call</p>
                        </div>
                        <div className="flex justify-center space-x-[-8px] mt-3 mb-4">
                            <img
                                src="/team/avatar-1.png"
                                alt="Avatar 1"
                                className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2"
                            />
                            <img
                                src="/team/avatar-2.png"
                                alt="Avatar 2"
                                className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2"
                            />
                            <img
                                src="/team/avatar-3.png"
                                alt="Avatar 3"
                                className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2"
                            />
                        </div>
                        <a
                            href="/demo"
                            className="inline-block bg-violet-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            Schedule a demo
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}