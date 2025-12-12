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

        // Build conversation context
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any, i: number) =>
                `${msg.type === 'you' ? 'VOCÊ' : 'LEAD'}: "${msg.content}"`
            ).join('\n')
            : '';

        // Check if Sul region
        const regionLower = (region || '').toLowerCase().trim();
        const useTu = regionLower === 'sul' || regionLower.includes('sul');

        // Count conversation turns
        const turnCount = conversationHistory?.length || 0;

        // Detect lead intent
        const leadLower = leadMessage.toLowerCase();
        const isAccepting = ['sim', 'pode', 'claro', 'quero', 'manda', 'ok', 'beleza', 'bora', 'vamos', 'tá', 'ta', 'show', 'perfeito', 'legal', 'manda aí', 'pode mandar'].some(w => leadLower.includes(w));
        const isObjection = leadLower.includes('caro') || leadLower.includes('planilha') || leadLower.includes('já tenho') || leadLower.includes('ja tenho') || leadLower.includes('não preciso') || leadLower.includes('nao preciso');

        const systemPrompt = `
Você é vendedor no WhatsApp. Seja DIRETO e ASSERTIVO.

PRODUTO: ${productName} - ${productDescription}

CONVERSA ATÉ AQUI:
${historyText || '(início)'}

LEAD DISSE: "${leadMessage}"

${useTu ? 'USE "TU" (região Sul): tu, teu, te.' : ''}

REGRAS DE OURO:
1. ${isAccepting ? '🟢 LEAD ACEITOU! MANDE O LINK ou diga "Te mandei aqui [link]" - NÃO pergunte de novo!' : ''}
2. ${isObjection ? '🟡 OBJEÇÃO! Valide primeiro ("entendo") depois mostre diferencial rápido.' : ''}
3. ${turnCount >= 3 ? '⚠️ Já são ' + turnCount + ' mensagens. É hora de FECHAR: mande link, marque demo, dê preço.' : ''}
4. NUNCA termine com "Quer que eu te mande X?" se você já ofereceu isso antes
5. Se já perguntou, agora MANDA: "Olha, te mandei o link: [link da demo]"
6. MÁXIMO 2 linhas
7. SEM EMOJI
8. Seja assertivo: "Te passo o acesso", "O link é esse:", "Vou te mandar agora"

Se o lead aceitou algo, NÃO pergunte novamente. FAÇA.
Ex: Lead disse "pode mandar" → Você: "Pronto, te mandei: [link]. Dá uma olhada e me conta."

Responda só o texto, sem aspas.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Responda de forma assertiva. ${isAccepting ? 'Lead disse SIM - MANDE agora!' : ''} ${turnCount >= 3 ? 'Hora de fechar!' : ''}` }
            ],
            temperature: 0.6,
            max_tokens: 100
        })

        let responseText = response.choices[0].message.content?.trim() || ''

        // Remove emojis
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
