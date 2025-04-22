"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");

    return (
        <main className="min-h-screen bg-[#f6f8f9] flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <div className="mb-6 text-center">
                    <div className="text-2xl font-semibold text-violet-600">Briefly</div>
                    <h1 className="text-xl font-bold mt-4 text-gray-800">Réinitialiser le mot de passe</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />

                    <button
                        type="submit"
                        className="w-full bg-violet-600 text-white font-medium py-2 rounded-md hover:bg-violet-700 transition-colors"
                    >
                        Envoyer le lien
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <Link href="/login" className="text-violet-600 hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </main>
    );
}