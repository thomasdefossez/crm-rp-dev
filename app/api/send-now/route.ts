import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

type CreateEmailResponseSuccess = {
  id: string;
  // autres champs éventuels
};

export async function POST(req: Request) {
    console.log("🔍 [API] /send-now appelé");

    try {
        const rawBody = await req.text();
        console.log("📩 Corps brut de la requête:", rawBody);

        const { recipients, senderName, senderEmail, subject, emailBody } = JSON.parse(rawBody);

        // Log des données reçues
        console.log('Données reçues:', { recipients, senderName, senderEmail, subject });
        console.log('🔎 Recipients (bruts):', JSON.stringify(recipients, null, 2));

        const toEmails = Array.isArray(recipients)
            ? recipients
                .map((r: any) => typeof r === 'string' ? r : (r?.email || r?.name))
                .filter((email: string) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                .map((email: string) => email.trim())
            : [];

        if (toEmails.length === 0) {
            return NextResponse.json(
                { success: false, error: { message: 'Aucune adresse email valide trouvée parmi les destinataires.' } },
                { status: 400 }
            );
        }

        const sentEmailIds: string[] = [];

        for (const email of toEmails) {
          const personalizedHtml = (emailBody && emailBody.trim().length > 0 ? emailBody : '<p>Contenu vide</p>') +
            `<img src="http://localhost:3000/api/open-track?campaign=${encodeURIComponent(subject)}&recipient=${encodeURIComponent(email)}" width="1" height="1" style="display:none;" />`;

          const res = await resend.emails.send({
            from: `${senderName || 'Briefly'} <${senderEmail || 'onboarding@resend.dev'}>`,
            to: [email],
            subject,
            html: personalizedHtml,
          });

          console.log(`📤 Email envoyé à ${email}`, res);

          if (res?.data?.id) {
            sentEmailIds.push(res.data.id);
            await supabase.from('emails').insert([{
              id: res.data.id,
              subject,
              to: JSON.stringify([email]),
              status: 'sent',
              created_at: new Date().toISOString(),
            }]);
          }
        }

        return NextResponse.json({ success: true, data: { sentEmailIds } });
    } catch (error: any) {
        console.error('Erreur lors de l\'envoi de l\'email :', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}