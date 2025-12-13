import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// POST: Generate message for bulk send
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { productName, productDescription } = body

        const openai = new OpenAI()

        const systemPrompt = `
Você é especialista em copywriting para WhatsApp. Crie uma mensagem de prospecção em massa.

PRODUTO/SERVIÇO: ${productName}
${productDescription ? `DESCRIÇÃO: ${productDescription}` : ''}

REGRAS OBRIGATÓRIAS:
1. Mensagem curta (3-4 linhas máximo)
2. Tom amigável e profissional
3. Use {nome} onde o nome do lead deve aparecer
4. Termine com pergunta ou CTA claro
5. SEM emoji
6. Seja direto e objetivo
7. Desperte curiosidade ou mostre benefício claro

EXEMPLOS DE ESTRUTURA:
- "Oi {nome}! [benefício/novidade]. [pergunta]"
- "Olá {nome}, [proposta de valor]. [CTA]"

Responda APENAS com a mensagem, sem aspas ou explicações.
`

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Gere uma mensagem de prospecção em massa para este produto." }
            ],
            temperature: 0.7,
            max_tokens: 150
        })

        const message = response.choices[0].message.content?.trim() || ''

        return NextResponse.json({ message })

    } catch (error) {
        console.error('Error generating bulk message:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar mensagem' },
            { status: 500 }
        )
    }
}
