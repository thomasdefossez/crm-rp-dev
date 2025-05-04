import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.resend.com/v1/emails', {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API Resend: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur Resend:', error);
    return NextResponse.json({ error: 'Erreur récupération emails' }, { status: 500 });
  }
}