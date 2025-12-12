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
            region
        } = body

        const openai = new OpenAI()

        // Build conversation context with clear labels
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any, i: number) =>
                `[${i + 1}] ${msg.type === 'you' ? 'VOCÊ' : 'LEAD'}: "${msg.content}"`
            ).join('\n')
            : '';

        // Check if Sul region - use TU
        const regionLower = (region || '').toLowerCase().trim();
        const useTu = regionLower === 'sul' || regionLower.includes('sul');

        console.log('Generate Response - Region:', region, '| useTu:', useTu);

        // Detect if lead is saying YES/accepting
        const leadLower = leadMessage.toLowerCase();
        const isAccepting = ['sim', 'pode', 'pode sim', 'claro', 'quero', 'manda', 'ok', 'beleza', 'bora', 'vamos', 'tá', 'ta', 'show', 'perfeito', 'legal'].some(w => leadLower.includes(w));

        const systemPrompt = `
Você é um vendedor amigo no WhatsApp. ANALISE o histórico e AVANCE a conversa.

PRODUTO: ${productName}
DESCRIÇÃO: ${productDescription}

HISTÓRICO DA CONVERSA:
${historyText || '(início)'}

MENSAGEM ATUAL DO LEAD: "${leadMessage}"

${useTu ? `
REGIÃO SUL - USE "TU":
- Diga "tu", "teu", "te" ao invés de "você", "seu"
- Ex: "tu viu", "pro teu negócio", "te ajuda"
` : ''}

REGRAS CRÍTICAS:
1. ${isAccepting ? '⚠️ O LEAD ACEITOU! Não pergunte de novo. DIGA A INFORMAÇÃO agora.' : 'Responda à pergunta/dúvida diretamente.'}
2. NUNCA repita a mesma pergunta que você já fez
3. Se o lead já disse SIM → dê o próximo passo concreto (link, preço, demo, etc)
4. Se ele perguntou algo → responda EXATAMENTE isso
5. MÁXIMO 2 linhas, tom coloquial
6. SEM EMOJI
7. Avance a venda a cada resposta

${isAccepting ? `
IMPORTANTE: O lead disse "${leadMessage}" que é um SIM.
NÃO pergunte "quer saber mais?" de novo.
DÊ a informação prometida ou ofereça próximo passo concreto.
` : ''}

Responda apenas com o texto da mensagem, sem aspas.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Responda de forma que AVANCE a conversa. ${isAccepting ? 'Lead aceitou - dê a informação!' : ''}` }
            ],
            temperature: 0.7,
            max_tokens: 120
        })

        let responseText = response.choices[0].message.content?.trim() || ''

        // Force remove any emojis
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
