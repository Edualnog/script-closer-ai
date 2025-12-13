import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint receives incoming WhatsApp messages and saves them to leads
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, from, text, timestamp } = body

        if (!userId || !from || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()

        // Clean phone number for matching
        let phone = from.replace(/\D/g, '')
        // Create variations for matching
        const phoneVariations = [
            phone,
            phone.startsWith('55') ? phone.slice(2) : phone,
            phone.startsWith('55') ? phone : '55' + phone
        ]

        console.log('[WhatsApp Incoming] Looking for lead with phone variations:', phoneVariations)

        // Find lead by phone number (using any variation)
        const { data: leads, error: findError } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', userId)

        if (findError) {
            console.error('[WhatsApp Incoming] Error finding leads:', findError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Find matching lead
        const lead = leads?.find(l => {
            if (!l.contato) return false
            const leadPhone = l.contato.replace(/\D/g, '')
            return phoneVariations.some(pv =>
                leadPhone.includes(pv) || pv.includes(leadPhone)
            )
        })

        if (!lead) {
            console.log('[WhatsApp Incoming] Lead not found for phone:', phone)
            return NextResponse.json({
                success: false,
                message: 'Lead not found',
                phone
            })
        }

        console.log('[WhatsApp Incoming] Found lead:', lead.nome, 'Adding message to history')

        // Add message to conversation history
        const history = lead.conversation_history || []
        const newHistory = [
            ...history,
            {
                type: 'lead',
                content: text,
                timestamp: timestamp || new Date().toISOString()
            }
        ]

        // Update lead with new message
        const { error: updateError } = await supabase
            .from('leads')
            .update({
                conversation_history: newHistory,
                updated_at: new Date().toISOString()
            })
            .eq('id', lead.id)

        if (updateError) {
            console.error('[WhatsApp Incoming] Error updating lead:', updateError)
            return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
        }

        console.log('[WhatsApp Incoming] ✅ Message saved to lead:', lead.nome)

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            leadName: lead.nome
        })

    } catch (error) {
        console.error('[WhatsApp Incoming] Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
