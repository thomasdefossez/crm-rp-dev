import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('emails')
    .select('id, subject, to, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error("❌ Supabase error:", error)
    return NextResponse.json({ error: 'Erreur Supabase' }, { status: 500 })
  }

  try {
    const formatted = data.map((email: any) => {
      let to = 'inconnu';

      try {
        const raw = email.to;
        console.log("📬 email.to type =", typeof raw, "valeur =", raw);
        if (typeof raw === 'string') {
          const trimmed = raw.trim();

          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            console.log("🔎 email.to (raw) =", raw);
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              to = parsed[0];
            }
          } else {
            to = raw; // simple string fallback
          }
        } else if (Array.isArray(email.to)) {
          to = email.to[0];
        } else {
          to = String(email.to);
        }
      } catch (err) {
        console.warn("⚠️ Erreur JSON.parse sur:", email.to);
        to = 'inconnu';
      }

      return {
        id: email.id,
        subject: email.subject || 'Sans objet',
        sender: to,
        status: email.status,
        date: email.created_at,
      };
    });

    console.log("📤 Emails formatés :", formatted.length);
    return NextResponse.json({ data: formatted });
  } catch (err) {
    console.error("💥 Erreur pendant le mapping:", err);
    return NextResponse.json({ error: 'Erreur dans le mapping' }, { status: 500 });
  }
}