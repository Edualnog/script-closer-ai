import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFollowUps } from '@/lib/ai/generator'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { productName, productDescription, conversationHistory, openingMessage } = body

        // Build full conversation history starting with opening message
        const fullHistory = [
            { type: 'you' as const, content: openingMessage || '' },
            ...(conversationHistory || [])
        ]

        const result = await generateFollowUps({
            productName: productName || 'Produto',
            productDescription: productDescription || '',
            conversationHistory: fullHistory
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error generating follow-ups:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar follow-ups' },
            { status: 500 }
        )
    }
}
