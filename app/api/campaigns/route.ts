// app/api/campaigns/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    const { name } = await req.json()

    if (!name) {
        return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('campaigns')
        .insert({ name })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
}