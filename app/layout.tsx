import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script"; // <-- Ajouté ici

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

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors closeButton />
        {/* Script Crisp */}
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