"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

export default function AvatarMenu({ user }: { user: any }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const initials = user?.user_metadata?.first_name?.[0]?.toUpperCase() || "U";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold"
            >
                {initials}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            )}
        </div>
    );
}