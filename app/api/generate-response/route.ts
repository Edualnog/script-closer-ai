import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const {
            productName,
            productDescription,
            leadMessage,
            conversationHistory
        } = body

        const openai = new OpenAI()

        // Build conversation context
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any) =>
                `${msg.type === 'you' ? 'Você' : 'Lead'}: "${msg.content}"`
            ).join('\n')
            : '';

        const systemPrompt = `
Você é um vendedor experiente via WhatsApp. Gere UMA resposta curta e persuasiva.

CONTEXTO:
- Produto: ${productName}
- Descrição: ${productDescription}
- Histórico:
${historyText}

MENSAGEM DO LEAD AGORA:
"${leadMessage}"

REGRAS:
1. Responda DIRETAMENTE à pergunta do lead
2. Se perguntou preço, fale sobre valor/investimento
3. Se fez objeção, contorne com empatia
4. Se mostrou interesse, avance para próximo passo
5. Máximo 2-3 linhas, tom natural de WhatsApp
6. Termine com pergunta para manter conversa
7. NÃO use emojis excessivos (máximo 1)

Responda APENAS com o texto da mensagem, sem aspas ou formatação.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Gere a resposta para: "${leadMessage}"` }
            ],
            temperature: 0.7,
            max_tokens: 200
        })

        const responseText = response.choices[0].message.content?.trim() || ''

        return NextResponse.json({ response: responseText })

    } catch (error) {
        console.error('Error generating response:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar resposta' },
            { status: 500 }
        )
    }
}
