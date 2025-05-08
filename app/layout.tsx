import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";
import { Providers } from "./providers";
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Briefly – CRM RP",
    description: "La plateforme pour piloter vos relations presse",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const cookieStore = await nextCookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options?: CookieOptions) {
                    // No-op for now
                },
                remove(name: string, options?: CookieOptions) {
                    // No-op for now
                },
            },
        }
    );
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return (
        <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers initialSession={session}>
            {children}
            <Toaster position="top-center" richColors closeButton />
        </Providers>
        <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
              window.$crisp = [];
              window.CRISP_WEBSITE_ID = "61248374-df9a-412c-a2ef-ba446cbe903a";
              (function() {
                var d = document;
                var s = d.createElement("script");
                s.src = "https://client.crisp.chat/l.js";
                s.async = 1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `,
            }}
        />
        </body>
        </html>
    );
}