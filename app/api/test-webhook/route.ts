import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Log du webhook reçu
        const body = await req.json();
        console.log('📨 Webhook reçu :', JSON.stringify(body, null, 2));

        // Retourner la réponse succès au client
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur Webhook:', error.message);
        return NextResponse.json({ error: 'Erreur traitement Webhook' }, { status: 500 });
    }
}