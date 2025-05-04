import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { recipients, senderName, senderEmail, subject, emailBody } = await req.json();

        // Log des données reçues
        console.log('Données reçues:', { recipients, senderName, senderEmail, subject });

        const toEmails = recipients.map((r: any) => r.email);

        // Envoi de l'email avec Resend
        const data = await resend.emails.send({
            from: `${senderName} <${senderEmail}>`,
            to: toEmails,
            subject,
            html: emailBody,
        });

        // Log de la réponse de Resend
        console.log('Réponse de Resend:', data);

        // Utilisation des données envoyées pour remplir l'insertion dans Supabase
        const { id } = data.data;
        const created_at = new Date().toISOString(); // Utilisation de l'heure actuelle
        const emailSubject = subject; // Utilisation du sujet envoyé
        const to = JSON.stringify(toEmails); // Utilisation des emails des destinataires

        // Log avant l'insertion dans Supabase
        console.log('Données à insérer dans Supabase:', {
            id,
            emailSubject,
            to,
            created_at,
        });

        // Insérer dans Supabase
        const { error } = await supabase.from('emails').insert([
            {
                id: id,
                subject: emailSubject,  // Utilisation de 'emailSubject'
                to: to, // Utilisation de 'to' formaté en JSON
                status: 'sent',
                created_at: created_at,
            },
        ]);

        if (error) {
            console.error('❌ Erreur Supabase:', error.message);
            return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
        }

        // Retourner une réponse de succès
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}