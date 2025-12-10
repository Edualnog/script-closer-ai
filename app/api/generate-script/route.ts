import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSalesScript } from '@/lib/ai/generator'
import { getPlanDetails } from '@/lib/plans'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, context, leadType, image, productId } = body

    // 1. Get User Info & Utils
    const { data: userData } = await supabase
        .from('users')
        .select('plano_atual')
        .eq('id', user.id)
        .single()

    const planName = userData?.plano_atual || 'free'
    const planDetails = getPlanDetails(planName)

    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    // 2. Check Usage Limits
    let { data: stats } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('mes_referencia', currentMonth)
        .single()

    if (!stats) {
        // Initialize stats if not exists
        const { data: newStats, error } = await supabase
            .from('usage_stats')
            .insert({
                user_id: user.id,
                mes_referencia: currentMonth,
                scripts_gerados: 0,
                mockups_gerados: 0,
                videos_gerados: 0
            })
            .select()
            .single()
        stats = newStats
    }

    if (stats.scripts_gerados >= planDetails.limits.scripts) {
        return NextResponse.json(
            { error: 'Limite mensal de scripts atingido. Faça upgrade para continuar.' },
            { status: 403 }
        )
    }

    // 3. Generate Content
    try {
        const aiResult = await generateSalesScript({
            productName: name,
            description,
            context,
            leadType,
            imageBase64: image
        })

        // 4. Save to Database
        let finalProductId = productId

        if (!finalProductId) {
            // Create new product
            const { data: newProduct, error: prodError } = await supabase
                .from('products')
                .insert({
                    user_id: user.id,
                    nome: name,
                    descricao: description,
                    segmento: 'Geral', // Could infer from AI
                    imagem_url: null, // Would upload image to storage here if real
                })
                .select()
                .single()

            if (prodError) throw prodError
            finalProductId = newProduct.id
        }

        // Save Script
        const { error: scriptError } = await supabase
            .from('scripts')
            .insert({
                user_id: user.id,
                product_id: finalProductId,
                tipo_lead: leadType,
                canal_venda: context,
                mensagem_abertura: aiResult.mensagem_abertura,
                roteiro_conversa: aiResult.roteiro_conversa,
                respostas_objecoes: aiResult.respostas_objecoes,
                follow_up: aiResult.follow_up,
                modelo_usado: 'gpt-4o-mock'
            })

        if (scriptError) throw scriptError

        // 5. Increment Usage
        await supabase
            .from('usage_stats')
            .update({ scripts_gerados: stats.scripts_gerados + 1, updated_at: new Date().toISOString() })
            .eq('id', stats.id)

        return NextResponse.json({ success: true, result: aiResult, productId: finalProductId })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: error.message || 'Erro na geração' }, { status: 500 })
    }
}
