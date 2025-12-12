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
            conversationHistory,
            region,
            salesChannel
        } = body

        const openai = new OpenAI()

        // Build conversation context
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any) =>
                `${msg.type === 'you' ? 'Vendedor' : 'Lead'}: "${msg.content}"`
            ).join('\n')
            : '';

        // Regional pronoun preference (subtle, not forced)
        const regionalNote = region === 'Sul'
            ? 'Use "tu" ao invés de "você" de forma natural (ex: "tu viu?", "tu consegue", "quer que eu te mande?").'
            : 'Use "você" normalmente.';

        const systemPrompt = `
Você é um vendedor amigo conversando pelo WhatsApp. Responda de forma NATURAL e COLOQUIAL.

PRODUTO:
${productName}: ${productDescription}

HISTÓRICO:
${historyText}

LEAD DISSE AGORA: "${leadMessage}"

ESTILO REGIONAL:
${regionalNote}

REGRAS ESSENCIAIS:
1. RESPONDA AO QUE O LEAD DISSE, não ignore a pergunta dele
2. Se ele perguntou algo específico, responda isso primeiro
3. Tom COLOQUIAL e AMIGÁVEL, como se fosse um amigo explicando
4. MÁXIMO 2-3 linhas curtas (WhatsApp é mobile!)
5. Termine com pergunta simples para continuar a conversa
6. NO MÁXIMO 1 emoji, se precisar
7. Seja direto, sem enrolação

EXEMPLOS DE TOM CORRETO:
- Lead: "quanto custa?" → "Olha, o investimento é X por mês. ${region === 'Sul' ? 'Cabe no teu' : 'Cabe no seu'} bolso?"
- Lead: "o que faz?" → "Basicamente te ajuda a [benefício]. ${region === 'Sul' ? 'Quer que eu te mostre' : 'Quer ver'} como funciona?"
- Lead: "diz" → "É assim: [explicação curta]. Fez sentido?"

Responda APENAS com a mensagem pronta, sem aspas.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Lead disse: "${leadMessage}". Gere resposta natural.` }
            ],
            temperature: 0.8,
            max_tokens: 150
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
