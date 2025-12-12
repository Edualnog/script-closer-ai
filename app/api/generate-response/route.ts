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

        // Check if Sul region - use TU (case insensitive check)
        const regionLower = (region || '').toLowerCase().trim();
        const useTu = regionLower === 'sul' || regionLower.includes('sul');

        console.log('Generate Response - Region:', region, '| useTu:', useTu);

        const systemPrompt = `
Você é um vendedor amigo conversando pelo WhatsApp. Responda de forma NATURAL e COLOQUIAL.

PRODUTO:
${productName}: ${productDescription}

HISTÓRICO:
${historyText}

LEAD DISSE AGORA: "${leadMessage}"

${useTu ? `
🔴 REGIÃO SUL - OBRIGATÓRIO USAR "TU":
- SEMPRE use "tu" ao invés de "você"
- Conjugue na 3ª pessoa: "tu viu", "tu consegue", "tu quer"
- Exemplos: "te ajuda", "teu negócio", "pro teu dia a dia"
- NUNCA escreva "você" - use APENAS "tu"
` : `
Use "você" normalmente.
`}

REGRAS CRÍTICAS:
1. RESPONDA AO QUE O LEAD DISSE diretamente
2. Tom COLOQUIAL, como um amigo explicando
3. MÁXIMO 2 linhas curtas
4. 🚫 PROIBIDO EMOJI - não use nenhum emoji
5. Termine com pergunta simples
6. Seja direto

Responda APENAS com a mensagem pronta. Sem aspas, sem emoji.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Lead disse: "${leadMessage}". Responda ${useTu ? 'usando TU (nunca você)' : 'normalmente'}, SEM emoji.` }
            ],
            temperature: 0.7,
            max_tokens: 100
        })

        let responseText = response.choices[0].message.content?.trim() || ''

        // Force remove any emojis that slipped through
        responseText = responseText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim()

        return NextResponse.json({ response: responseText })

    } catch (error) {
        console.error('Error generating response:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar resposta' },
            { status: 500 }
        )
    }
}
