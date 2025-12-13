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
        const { leadName, leadStatus, leadNotas, lastContactDate, productName, conversationHistory } = body

        const openai = new OpenAI()

        // Calculate days since last contact
        const daysSinceContact = lastContactDate
            ? Math.floor((Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
            : null

        // Build context based on status and time
        const getContextByStatus = () => {
            switch (leadStatus) {
                case 'novo':
                    return 'Lead novo, nunca contatado. Objetivo: fazer primeiro contato amigável e despertar interesse.'
                case 'em_conversa':
                    if (daysSinceContact && daysSinceContact > 7) {
                        return `Lead em conversa mas sem resposta há ${daysSinceContact} dias. Objetivo: reengajar de forma leve, sem parecer desesperado.`
                    } else if (daysSinceContact && daysSinceContact > 3) {
                        return `Lead em conversa, última interação há ${daysSinceContact} dias. Objetivo: follow-up gentil para retomar conversa.`
                    }
                    return 'Lead em conversa ativa. Objetivo: avançar para próximo passo (demo, proposta, etc).'
                case 'convertido':
                    return 'Lead já convertido. Objetivo: mensagem de pós-venda, pedir indicação ou oferecer upgrade.'
                case 'perdido':
                    return `Lead perdido. ${daysSinceContact && daysSinceContact > 30 ? 'Faz mais de 1 mês.' : ''} Objetivo: reativar com novidade ou oferta especial.`
                default:
                    return 'Objetivo: manter contato e avançar relacionamento.'
            }
        }

        // Format conversation history if available
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any, i: number) =>
                `${msg.type === 'you' ? 'VOCÊ' : 'LEAD'}: "${msg.content}"`
            ).join('\n')
            : ''

        const systemPrompt = `
Você é um especialista em vendas pelo WhatsApp. Gere UMA mensagem pronta para enviar ao lead.

LEAD: ${leadName}
${productName ? `PRODUTO/SERVIÇO: ${productName}` : ''}
STATUS: ${leadStatus}
${leadNotas ? `NOTAS SOBRE O LEAD: ${leadNotas}` : ''}
${daysSinceContact !== null ? `DIAS DESDE ÚLTIMO CONTATO: ${daysSinceContact}` : 'PRIMEIRO CONTATO'}
${historyText ? `\nHISTÓRICO DA CONVERSA:\n${historyText}` : ''}

CONTEXTO: ${getContextByStatus()}

REGRAS:
1. Mensagem curta (2-3 linhas máximo)
2. Tom amigável e natural de WhatsApp
3. Personalize usando o nome do lead
4. ${historyText ? 'Continue a conversa de onde parou, fazendo referência ao último assunto discutido' : 'Termine com pergunta ou call-to-action claro'}
5. SEM emoji
6. Use "você" normalmente

Responda APENAS com a mensagem pronta, sem aspas ou explicações.
`

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Gere a mensagem de follow-up ideal para este lead." }
            ],
            temperature: 0.7,
            max_tokens: 150
        })

        const suggestion = response.choices[0].message.content?.trim() || ''

        return NextResponse.json({ suggestion })

    } catch (error) {
        console.error('Error generating lead suggestion:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar sugestão' },
            { status: 500 }
        )
    }
}
