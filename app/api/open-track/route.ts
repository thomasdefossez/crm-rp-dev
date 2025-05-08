import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const campaignId = searchParams.get('campaign')
    const recipient = searchParams.get('recipient')

    if (!campaignId || !recipient) {
        return new NextResponse('Missing parameters', { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('email_open_events').insert({
        campaign_id: campaignId,
        recipient_email: recipient,
        opened_at: new Date(),
    })

    const transparentGif = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
    const buffer = Buffer.from(transparentGif, 'base64')

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*',
        },
    })
}