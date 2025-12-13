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
                        return `Lead em conversa mas sem resposta há ${daysSinceContact} dias. Objetivo: reengajar sem parecer desesperado.`
                    } else if (daysSinceContact && daysSinceContact > 3) {
                        return `Lead em conversa, última interação há ${daysSinceContact} dias. Objetivo: follow-up para retomar conversa.`
                    }
                    return 'Lead em conversa ativa. Objetivo: avançar para próximo passo (demo, proposta, etc).'
                case 'convertido':
                    return 'Lead já convertido. Objetivo: pós-venda, pedir indicação ou oferecer upgrade.'
                case 'perdido':
                    return `Lead perdido. ${daysSinceContact && daysSinceContact > 30 ? 'Faz mais de 1 mês.' : ''} Objetivo: reativar com novidade.`
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

        // Persuasion techniques based on status
        const getPersuasionTechniques = () => {
            const techniques = []

            switch (leadStatus) {
                case 'novo':
                    techniques.push(
                        'RECIPROCIDADE: Ofereça um insight ou dica valiosa grátis primeiro',
                        'CURIOSIDADE: Use pergunta que gere interesse ("Já pensou em X?")',
                        'AFINIDADE: Crie conexão pessoal, mostre que entende o contexto dele'
                    )
                    break
                case 'em_conversa':
                    if (daysSinceContact && daysSinceContact > 7) {
                        techniques.push(
                            'ESCASSEZ: "Vi uma oportunidade que pode te interessar, mas preciso de resposta até X"',
                            'PROVA SOCIAL: Mencione casualmente que outros já estão tendo resultados',
                            'CONSISTÊNCIA: Lembre do interesse que ele demonstrou antes'
                        )
                    } else {
                        techniques.push(
                            'ANTECIPAÇÃO: Gere expectativa sobre próximo passo',
                            'AUTORIDADE: Mencione um resultado ou número impressionante',
                            'EXCLUSIVIDADE: "Preparei algo especialmente pra ti"'
                        )
                    }
                    break
                case 'convertido':
                    techniques.push(
                        'RECIPROCIDADE: Agradeça e ofereça bônus surpresa',
                        'PROVA SOCIAL: "Outros clientes estão comentando que X"',
                        'AFINIDADE: Mensagem pessoal de acompanhamento'
                    )
                    break
                case 'perdido':
                    techniques.push(
                        'ESCASSEZ: Oferta com prazo limitado para reativar',
                        'FOMO: "Outros leads como você já estão usando"',
                        'NOVIDADE: Mencione upgrade ou feature nova'
                    )
                    break
            }
            return techniques.slice(0, 2).join('\n- ') // Use max 2 techniques
        }

        // Detect objection patterns in conversation history
        const detectObjections = () => {
            if (!conversationHistory || conversationHistory.length === 0) return null

            const lastMessages = conversationHistory.slice(-3).map((m: any) => m.content.toLowerCase()).join(' ')

            if (lastMessages.includes('caro') || lastMessages.includes('preço') || lastMessages.includes('valor')) {
                return 'OBJEÇÃO PREÇO: Foque em ROI - quanto ele GANHA ou ECONOMIZA, não no custo. Use: "O custo de NÃO ter é maior"'
            }
            if (lastMessages.includes('tempo') || lastMessages.includes('ocupado') || lastMessages.includes('depois')) {
                return 'OBJEÇÃO TEMPO: Mostre que economiza tempo. Use: "Por isso mesmo, isso vai te poupar X horas"'
            }
            if (lastMessages.includes('já tenho') || lastMessages.includes('ja tenho') || lastMessages.includes('planilha') || lastMessages.includes('uso outro')) {
                return 'OBJEÇÃO SOLUÇÃO EXISTENTE: Destaque diferencial único. Use: "A diferença é que X faz Y automaticamente"'
            }
            if (lastMessages.includes('pensar') || lastMessages.includes('depois') || lastMessages.includes('talvez')) {
                return 'OBJEÇÃO ADIAMENTO: Crie micro-urgência. Use: "Só pra te ajudar a decidir, posso te mostrar em 5 min?"'
            }
            return null
        }

        const objectionStrategy = detectObjections()

        const systemPrompt = `
Você é um ESPECIALISTA em vendas persuasivas pelo WhatsApp, usando técnicas de Robert Cialdini e gatilhos mentais.

LEAD: ${leadName}
${productName ? `PRODUTO/SERVIÇO: ${productName}` : ''}
STATUS: ${leadStatus}
${leadNotas ? `NOTAS SOBRE O LEAD: ${leadNotas}` : ''}
${daysSinceContact !== null ? `DIAS DESDE ÚLTIMO CONTATO: ${daysSinceContact}` : 'PRIMEIRO CONTATO'}
${historyText ? `\nHISTÓRICO DA CONVERSA:\n${historyText}` : ''}

CONTEXTO: ${getContextByStatus()}

${objectionStrategy ? `\n⚠️ ESTRATÉGIA DE OBJEÇÃO:\n${objectionStrategy}\n` : ''}

🧠 TÉCNICAS DE PERSUASÃO A APLICAR:
- ${getPersuasionTechniques()}

📋 REGRAS ABSOLUTAS:
1. Mensagem curta (2-3 linhas máximo)
2. Tom amigável e natural de WhatsApp
3. Personalize usando o nome do lead
4. ${historyText ? 'Continue a conversa de onde parou, fazendo referência ao último assunto' : 'Termine com pergunta ou CTA claro'}
5. SEM emoji
6. Use "você" normalmente
7. Aplique 1-2 gatilhos de forma NATURAL, sem parecer forçado
8. Seja específico, não genérico

Responda APENAS com a mensagem pronta, sem aspas ou explicações.
`

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Gere uma mensagem de follow-up persuasiva e natural para este lead." }
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
