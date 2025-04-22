"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import AvatarMenu from "@/components/AvatarMenu";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardNavbar() {
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

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
        { href: "/reporting", label: "Reporting" },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="text-xl font-bold text-violet-600">
                    Briefly
                </Link>

                {/* Desktop navigation */}
                <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-violet-600">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <NotificationBell />

                    <div className="hidden md:flex items-center gap-3">
                        {daysLeft !== null && (
                            <Link href="/upgrade">
                                <button className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-md leading-tight">
                                    Upgrade plan
                                    <span className="block text-xs font-normal text-gray-300">
                    {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                  </span>
                                </button>
                            </Link>
                        )}

                        <Link href="/demo">
                            <button className="border border-gray-300 text-sm text-gray-800 px-4 py-1.5 rounded-md hover:bg-gray-50 transition">
                                Book a demo
                            </button>
                        </Link>
                    </div>

                    {user && <AvatarMenu user={user} />}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-violet-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
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