

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Assure-toi que ce chemin est correct

export async function POST(req: Request) {
    try {
        const { recipients, senderName, senderEmail, subject, emailBody } = await req.json();

        // 🔥 Log pour vérifier les données reçues
        console.log('🔔 Données reçues pour le brouillon :', { recipients, senderName, senderEmail, subject, emailBody });

        const { data, error } = await supabase
            .from('drafts')
            .insert([{ recipients, senderName, senderEmail, subject, emailBody }]);

        if (error) {
            console.error('❌ Erreur lors de l’enregistrement du brouillon :', error);
            return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('❌ Erreur lors de la sauvegarde du brouillon :', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}