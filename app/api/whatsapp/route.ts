import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { whatsappManager } from '@/lib/whatsapp'

// GET - Get WhatsApp connection status and QR code
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const state = whatsappManager.getState(user.id)

        return NextResponse.json(state)

    } catch (error) {
        console.error('Error getting WhatsApp status:', error)
        return NextResponse.json({ error: 'Falha ao buscar status' }, { status: 500 })
    }
}

// POST - Connect or send message
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { action, to, message } = body

        if (action === 'connect') {
            await whatsappManager.connect(user.id)
            // Wait a bit for initial state
            await new Promise(resolve => setTimeout(resolve, 1000))
            const state = whatsappManager.getState(user.id)
            return NextResponse.json(state)
        }

        if (action === 'disconnect') {
            await whatsappManager.disconnect(user.id)
            return NextResponse.json({ status: 'disconnected' })
        }

        if (action === 'send') {
            console.log('[API WhatsApp] Send action received')
            console.log('[API WhatsApp] To:', to, 'Message:', message)

            if (!to || !message) {
                return NextResponse.json({ error: 'Destinatário e mensagem são obrigatórios' }, { status: 400 })
            }

            try {
                console.log('[API WhatsApp] Calling whatsappManager.sendMessage...')
                const success = await whatsappManager.sendMessage(user.id, to, message)
                console.log('[API WhatsApp] Send success:', success)
                return NextResponse.json({ success })
            } catch (sendError: any) {
                console.error('[API WhatsApp] Send error:', sendError)
                return NextResponse.json({ success: false, error: sendError.message }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })

    } catch (error: any) {
        console.error('WhatsApp error:', error)
        return NextResponse.json(
            { error: error.message || 'Falha na operação' },
            { status: 500 }
        )
    }
}
