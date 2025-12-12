import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { scriptId, conversationHistory } = body

        if (!scriptId || !conversationHistory) {
            return NextResponse.json({ error: 'Missing scriptId or conversationHistory' }, { status: 400 })
        }

        // Update the script with the conversation history
        const { error } = await supabase
            .from('scripts')
            .update({
                conversation_history: conversationHistory,
                updated_at: new Date().toISOString()
            })
            .eq('id', scriptId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error saving conversation:', error)
            return NextResponse.json({ error: 'Falha ao salvar conversa' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error saving conversation:', error)
        return NextResponse.json(
            { error: 'Falha ao salvar conversa' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const scriptId = searchParams.get('scriptId')

        if (!scriptId) {
            return NextResponse.json({ error: 'Missing scriptId' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('scripts')
            .select('conversation_history')
            .eq('id', scriptId)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error loading conversation:', error)
            return NextResponse.json({ conversationHistory: [] })
        }

        return NextResponse.json({
            conversationHistory: data?.conversation_history || []
        })

    } catch (error) {
        console.error('Error loading conversation:', error)
        return NextResponse.json({ conversationHistory: [] })
    }
}
