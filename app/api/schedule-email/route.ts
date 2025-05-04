import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient'; // Assure-toi que supabaseClient est correctement configuré.

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { recipients, senderName, senderEmail, subject, emailBody, timezone, scheduledDate, scheduledTime } = await req.json();

        // Combine date et heure en une seule chaîne ISO
        const scheduledDateTime = new Date(scheduledDate);
        const [hours, minutes] = scheduledTime.split(':');
        scheduledDateTime.setHours(Number(hours));
        scheduledDateTime.setMinutes(Number(minutes));

        // Stockage de l'email dans la table Supabase
        const { data, error } = await supabase
            .from('scheduled_emails')
            .insert([
                {
                    recipients: JSON.stringify(recipients),
                    sender_name: senderName,
                    sender_email: senderEmail,
                    subject,
                    email_body: emailBody,
                    scheduled_datetime: scheduledDateTime.toISOString(),
                }
            ]);

        if (error) {
            console.error('❌ Erreur lors de l\'enregistrement de l\'email dans la base de données', error);
            return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
        }

        // Log de la confirmation dans Supabase
        console.log('📬 Email planifié dans Supabase:', data);

        // Simuler la planification (ajouter la logique de cron ou de worker pour envoyer l'email plus tard)
        if (!data || data.length === 0 || !data[0]) {
            return NextResponse.json({
                success: false,
                error: { message: "Aucune donnée retournée depuis Supabase" },
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Email planifié avec succès !',
            scheduledEmailId: data[0].id,
        });
    } catch (error: any) {
        console.error('❌ Erreur lors de la planification :', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}