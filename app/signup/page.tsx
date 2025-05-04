"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { email, password, firstName, lastName, phone, company } = form;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    company,
                },
            },
        });

        setLoading(false);

        if (error) {
            console.error("❌ Erreur inscription :", error.message);
        } else {
            console.log("✅ Utilisateur inscrit :", data);
        }
    };

    return (
        <main className="min-h-screen bg-[#f6f8f9] flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="mb-6 text-center">
                    <div className="text-2xl font-semibold text-violet-600">Briefly</div>
                    <h1 className="text-xl font-bold mt-4 text-gray-800">Créer un compte</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Accédez à votre espace en quelques clics
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={form.firstName}
                            onChange={(e) =>
                                setForm({ ...form, firstName: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            required
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Email professionnel"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                    />
                    <input
                        type="tel"
                        placeholder="Téléphone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <input
                        type="text"
                        placeholder="Société"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-violet-600 text-white font-medium py-2 rounded-md hover:bg-violet-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Création en cours..." : "Créer mon compte"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Vous avez déjà un compte ?{" "}
                    <Link href="/login" className="text-violet-600 hover:underline">
                        Se connecter
                    </Link>
                </div>
            </div>
        </main>
    );
}