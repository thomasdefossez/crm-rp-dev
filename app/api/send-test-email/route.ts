import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialise Resend avec ta clé API depuis .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        // 🔥 LOG pour vérifier que les données arrivent bien
        console.log('🔔 Données reçues dans l’API :', { to, subject, html });

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Expéditeur par défaut Resend
            to,
            subject,
            html,
        });

        // 🔥 LOG pour vérifier la réponse de Resend
        console.log('📬 Réponse de Resend :', data);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('❌ Erreur lors de l’envoi de l’email :', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}