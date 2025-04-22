"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error("Erreur de connexion", {
                description: "Vérifie ton email ou ton mot de passe.",
            });
        } else {
            toast.success("Bienvenue 👋", {
                description: "Connexion réussie, redirection en cours...",
            });
            router.push("/dashboard");
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#f6f8f9] flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="mb-6 text-center">
                    <div className="text-2xl font-semibold text-violet-600">Briefly</div>
                    <h1 className="text-xl font-bold mt-4 text-gray-800">Se connecter à votre compte</h1>
                    <p className="text-sm text-gray-500 mt-1">Bienvenue de retour sur la plateforme</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex justify-end text-sm">
                        <Link href="/reset-password" className="text-violet-600 hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 text-white font-medium py-2 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Pas encore de compte ?{" "}
                    <Link href="/signup" className="text-violet-600 hover:underline">
                        Créer un compte
                    </Link>
                </div>
            </div>
        </main>
    );
}