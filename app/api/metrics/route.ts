import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Get all scripts for the user
        const { data: scripts, error } = await supabase
            .from('scripts')
            .select('status, mensagens_trocadas, created_at')
            .eq('user_id', user.id)

        if (error) throw error

        const totalScripts = scripts?.length || 0
        const convertidos = scripts?.filter(s => s.status === 'convertido').length || 0
        const perdidos = scripts?.filter(s => s.status === 'perdido').length || 0
        const emAndamento = scripts?.filter(s => s.status === 'em_andamento' || !s.status).length || 0

        // Calculate conversion rate (only count closed scripts)
        const closedScripts = convertidos + perdidos
        const taxaConversao = closedScripts > 0 ? (convertidos / closedScripts) * 100 : 0

        // Calculate average messages
        const totalMensagens = scripts?.reduce((sum, s) => sum + (s.mensagens_trocadas || 0), 0) || 0
        const mediaMensagens = totalScripts > 0 ? totalMensagens / totalScripts : 0

        return NextResponse.json({
            totalScripts,
            convertidos,
            perdidos,
            emAndamento,
            taxaConversao,
            mediaMensagens
        })

    } catch (error) {
        console.error('Error fetching metrics:', error)
        return NextResponse.json(
            { error: 'Falha ao buscar métricas' },
            { status: 500 }
        )
    }
}
