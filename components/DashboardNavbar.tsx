"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Users, FolderOpen, List, Mail, BarChart2, LineChart } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import AvatarMenu from "@/components/AvatarMenu";
import { supabase } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null); // Ajout de l'état activeMenu
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const user = data.user;
            setUser(user);

            const expiryDateStr = user?.user_metadata?.plan_expiry;
            if (expiryDateStr) {
                const expiry = new Date(expiryDateStr);
                const today = new Date();
                const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                setDaysLeft(diff);
            }
        });
    }, []);

    const navLinks = [
        { href: "/contacts", label: "Contacts" },
        { href: "/emails", label: "Emails" },
        { href: "/newsroom", label: "Newsroom" },
        { href: "/reporting", label: "Rapports" },
    ];

    const handleMenuClick = (menu: string) => {
        setActiveMenu(prevMenu => (prevMenu === menu ? null : menu));  // Toggle the active menu
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold text-violet-600">
                    Briefly
                </Link>

                <nav className="hidden md:flex gap-4 text-sm font-medium text-gray-800 relative">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <div key={link.href} className="relative">
                                <Link
                                  href={link.href}
                                  className={`px-3 py-1.5 rounded-full transition ${
                                    isActive ? "bg-gray-200 text-gray-900" : "hover:bg-gray-50"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault(); // Empêche la navigation immédiate
                                    handleMenuClick(link.href);  // Gère l'ouverture et la fermeture des sous-menus
                                  }}
                                >
                                  {link.label}
                                </Link>

                                {/* Sous-menu Contacts */}
                                {link.href === "/contacts" && activeMenu === "/contacts" && (
                                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4 z-50">
                                    <Link
                                      href="/contacts/database"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <Users className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Base de données des médias</p>
                                        <p className="text-xs text-gray-500">Trouvez des contacts médias pertinents</p>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/contacts/my-contacts"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <FolderOpen className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium text-violet-600">Mes contacts</p>
                                        <p className="text-xs text-gray-500">Collaborer pour organiser les connaissances sur les contacts médias</p>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/contacts/lists"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <List className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Listes de médias</p>
                                        <p className="text-xs text-gray-500">Créez des listes fixes ou mises à jour automatiquement</p>
                                      </div>
                                    </Link>
                                  </div>
                                )}

                                {/* Sous-menu Emails */}
                                {link.href === "/emails" && activeMenu === "/emails" && (
                                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4 z-50">
                                    <Link
                                      href="/emails/dashboard"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <Mail className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Emails</p>
                                        <p className="text-xs text-gray-500">Envoyer des emails personnalisés et suivre leur performance</p>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/emails/campaigns"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <BarChart2 className="w-5 h-5 text-gray-600 mt-1" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Campagnes</p>
                                        <p className="text-xs text-gray-500">Comparer et analyser les données de performance des campagnes</p>
                                      </div>
                                    </Link>
                                    <Link
                                      href="/emails/analytics"
                                      className="flex items-start gap-3 hover:bg-gray-50 rounded-md p-2"
                                      onClick={() => setActiveMenu(null)}
                                    >
                                      <LineChart className="w-5 h-5 text-gray-600 mt-1" />
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">Analytique</p>
                                        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Nouveau</span>
                                         
                                      </div>
                                      
                                    </Link>
                                  </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <div className="hidden md:flex items-center gap-3">
                        {daysLeft !== null && (
                            <Link href="/upgrade">
                                <button className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-md leading-tight">
                                    Mettre à niveau le plan
                                    <span className="block text-xs font-normal text-gray-300">
                                        {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                                    </span>
                                </button>
                            </Link>
                        )}
                        <Link href="/demo">
                            <button className="border border-gray-300 text-sm text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-50 transition">
                                Réserver une démo
                            </button>
                        </Link>
                    </div>
                    {user && <AvatarMenu user={user} />}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-violet-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {menuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white px-4 py-2 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-sm text-gray-700 hover:text-violet-600"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
