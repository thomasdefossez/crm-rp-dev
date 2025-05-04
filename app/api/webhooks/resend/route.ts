import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        console.log('📡 Requête POST reçue sur /api/webhooks/resend');
        const body = await req.json();

        // Log du webhook reçu
        console.log('📨 Webhook reçu :', JSON.stringify(body, null, 2));

        const { data, type } = body;

        // Appeler la fonction pour traiter et insérer les données
        const insertedData = await processWebhookData(data);

        console.log('✅ Email inséré dans Supabase:', insertedData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur Webhook:', error.message);
        return NextResponse.json({ error: 'Erreur traitement Webhook' }, { status: 500 });
    }
}

// Fonction de traitement des données avant insertion
async function processWebhookData(data: any) {
    const { email_id, subject, to, created_at, type } = data;

    // Préparer les données pour Supabase (par exemple, transformer 'to' en string JSON)
    const emailData = {
        id: email_id,
        subject,
        to: JSON.stringify(to), // Assurer que 'to' est une chaîne JSON valide
        status: type,
        created_at: created_at,
    };

    // Insérer dans Supabase
    const { data: insertedData, error } = await supabase.from('emails').insert([emailData]);

    if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return insertedData;
}