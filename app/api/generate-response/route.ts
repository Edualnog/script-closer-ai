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
            leadType,      // frio, morno, quente
            region,        // Sul, Nordeste, SP, RJ, Neutro
            salesChannel   // WhatsApp, LinkedIn, etc.
        } = body

        const openai = new OpenAI()

        // Build conversation context
        const historyText = conversationHistory && conversationHistory.length > 0
            ? conversationHistory.map((msg: any) =>
                `${msg.type === 'you' ? 'Você' : 'Lead'}: "${msg.content}"`
            ).join('\n')
            : '';

        // Regional language adaptation
        const getRegionalStyle = (r: string) => {
            switch (r) {
                case 'Sul':
                    return 'Use "tu" conjugado na 3ª pessoa (tu viu, tu consegue). Tom direto mas acolhedor.';
                case 'Rio de Janeiro':
                    return 'Tom despojado e direto. Pode usar "você/tu", gírias leves (beleza, tranquilo).';
                case 'São Paulo':
                    return 'Tom prático, ágil e focado. Objetivo e profissional.';
                case 'Nordeste':
                    return 'Tom acolhedor e próximo. Hospitalidade natural, sem estereótipos.';
                default:
                    return 'Português padrão do Brasil. Use "você".';
            }
        };

        // Lead type adaptation
        const getLeadTypeStyle = (t: string) => {
            switch (t) {
                case 'frio':
                    return 'Lead FRIO: Seja amigável, não force. Busque entender a necessidade primeiro.';
                case 'morno':
                    return 'Lead MORNO: Já demonstrou interesse. Agregue valor, eduque sobre benefícios.';
                case 'quente':
                    return 'Lead QUENTE: Pronto para decidir. Seja direto, remova objeções, conduza ao fechamento.';
                default:
                    return '';
            }
        };

        const systemPrompt = `
Você é um vendedor experiente via ${salesChannel || 'WhatsApp'}. Gere UMA resposta curta e persuasiva.

CONTEXTO DO PRODUTO:
- Produto: ${productName}
- Descrição: ${productDescription}

PERFIL DO LEAD:
${getLeadTypeStyle(leadType || 'morno')}

REGIONALIZAÇÃO (IMPORTANTE):
${getRegionalStyle(region || 'Neutro')}

HISTÓRICO DA CONVERSA:
${historyText || 'Início da conversa'}

MENSAGEM ATUAL DO LEAD:
"${leadMessage}"

REGRAS DE RESPOSTA:
1. Responda DIRETAMENTE à pergunta/situação do lead
2. Use o SOTAQUE/ESTILO regional adequado
3. Adapte ao ESTÁGIO do lead (frio/morno/quente)
4. Se perguntou preço → fale sobre valor/investimento, não apenas número
5. Se fez objeção → contorne com empatia, valide antes de argumentar
6. Se mostrou interesse → avance para próximo passo
7. Máximo 2-3 linhas curtas (WhatsApp é mobile!)
8. Termine com pergunta para manter conversa ativa
9. Máximo 1 emoji, se usar
10. Tom natural, humano, NÃO robótico

Responda APENAS com o texto da mensagem pronta para enviar. Sem aspas, sem formatação extra.
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
