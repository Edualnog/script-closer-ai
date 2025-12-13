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
        const isAccepting = ['sim', 'pode', 'claro', 'quero', 'manda', 'ok', 'beleza', 'bora', 'vamos', 'tá', 'ta', 'show', 'perfeito', 'legal', 'manda aí', 'pode mandar', 'fechado', 'bora lá'].some(w => leadLower.includes(w));
        const isObjection = ['caro', 'preço', 'tempo', 'ocupado', 'já tenho', 'pensar', 'não sei'].some(w => leadLower.includes(w));

        // Expanded objection detection
        const detectObjection = () => {
            const objections = {
                price: ['caro', 'preço', 'valor', 'dinheiro', 'custo', 'investimento', 'pagar'],
                time: ['tempo', 'ocupado', 'corrido', 'agora não', 'depois', 'semana que vem'],
                existing: ['já tenho', 'ja tenho', 'uso outro', 'planilha', 'excel', 'já uso', 'ja uso'],
                thinking: ['pensar', 'analisar', 'ver com', 'consultar', 'talvez', 'não sei', 'nao sei'],
                trust: ['não conheço', 'nao conheco', 'nunca ouvi', 'funciona mesmo', 'é seguro']
            }

            for (const [type, keywords] of Object.entries(objections)) {
                if (keywords.some(k => leadLower.includes(k))) {
                    return type
                }
            }
            return null
        }

        const objectionType = detectObjection()

        // Objection handling strategies
        const objectionStrategies: Record<string, string> = {
            price: `
🔴 OBJEÇÃO DE PREÇO DETECTADA!
ESTRATÉGIA: Não defenda o preço - mude o frame para VALOR
- "Entendo, e justamente por isso quero te mostrar quanto tu ECONOMIZA"
- Foque no CUSTO de NÃO ter (perda de tempo, dinheiro, oportunidades)
- Se possível, faça conta de ROI: "Se tu ganha X por mês, isso se paga em Y dias"`,
            time: `
🟡 OBJEÇÃO DE TEMPO DETECTADA!
ESTRATÉGIA: Mostre que ECONOMIZA tempo, não usa
- "Por isso mesmo! Isso é justamente pra quem não tem tempo"
- Ofereça demo ultra-rápida: "Em 5 minutos te mostro"
- Use escassez: "Posso te atender agora, depois fico sem agenda"`,
            existing: `
🟠 OBJEÇÃO DE SOLUÇÃO EXISTENTE DETECTADA!
ESTRATÉGIA: Não critique a solução atual - mostre o upgrade
- "Ótimo que já usa algo! A diferença é que isso faz X automaticamente"
- Foque no que eles NÃO conseguem fazer atualmente
- Pergunte: "E como está o resultado com isso?" (gera reflexão)`,
            thinking: `
🟣 OBJEÇÃO DE ADIAMENTO DETECTADA!
ESTRATÉGIA: Crie micro-compromisso + escassez leve
- "Total! Só pra te ajudar a decidir, posso te mostrar uma coisa rápida?"
- "O que especificamente tu precisa analisar? Te ajudo"
- Escassez: "Esses valores são só até sexta"`,
            trust: `
🔵 OBJEÇÃO DE CONFIANÇA DETECTADA!
ESTRATÉGIA: Prova social + autoridade + redução de risco
- "Normal! Deixa eu te mostrar um case de cliente parecido contigo"
- Mencione números: "Já ajudamos X empresas, Y% tiveram resultado"
- Ofereça garantia: "Se não gostar, cancela sem problema"`
        }

        const systemPrompt = `
Você é vendedor ESPECIALISTA no WhatsApp usando técnicas de Robert Cialdini. Seja DIRETO e ASSERTIVO.

PRODUTO: ${productName} - ${productDescription}

CONVERSA ATÉ AQUI:
${historyText || '(início)'}

LEAD DISSE: "${leadMessage}"

${useTu ? `
🔴 OBRIGATÓRIO - REGIÃO SUL:
- SEMPRE use "tu", "ti", "te", "teu", "tua"
- NUNCA use "você", "seu", "sua"
- Exemplos: "pra ti", "te mostro", "teu negócio", "melhor pra ti"
` : ''}

${objectionType ? objectionStrategies[objectionType] : ''}

🧠 TÉCNICAS DE PERSUASÃO:
${isAccepting ? `
✅ LEAD ACEITOU! Use:
- CONSISTÊNCIA: Reforce a boa decisão ("Ótima escolha!")
- Mande o link/próximo passo AGORA - não pergunte de novo` : ''}
${turnCount >= 3 ? `
⏰ JÁ SÃO ${turnCount} MENSAGENS! Use:
- ESCASSEZ: "Esse valor é só até amanhã"
- AUTORIDADE: "Dos clientes que fecham, 90% é no primeiro contato"
- FECHAMENTO DIRETO: "Te passo o link agora?"` : ''}
${!isAccepting && !isObjection ? `
🎯 TÉCNICAS GERAIS:
- RECIPROCIDADE: Dê algo de valor antes de pedir
- PROVA SOCIAL: "Outras empresas como a tua..."
- CURIOSIDADE: "Deixa eu te mostrar uma coisa interessante"` : ''}

📋 REGRAS DE OURO:
1. NUNCA repita pergunta que já fez
2. MÁXIMO 2 linhas
3. SEM EMOJI
4. Seja assertivo: "Te passo agora", "O link é esse"
5. Use 1 gatilho por mensagem, de forma NATURAL

Responda só o texto, sem aspas.
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Responda de forma persuasiva e assertiva. ${isAccepting ? 'Lead disse SIM - MANDE agora!' : ''} ${turnCount >= 3 ? 'Hora de fechar!' : ''} ${objectionType ? 'TRATE A OBJEÇÃO primeiro!' : ''}` }
            ],
            temperature: 0.6,
            max_tokens: 100
        })

        let responseText = response.choices[0].message.content?.trim() || ''

        // Remove emojis
        responseText = responseText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim()

        // Force tu for Sul region (post-processing fix)
        if (useTu) {
            responseText = responseText
                .replace(/\bvocê\b/gi, 'tu')
                .replace(/\bpara você\b/gi, 'pra ti')
                .replace(/\bpra você\b/gi, 'pra ti')
                .replace(/\bcom você\b/gi, 'contigo')
                .replace(/\bseu\b/gi, 'teu')
                .replace(/\bsua\b/gi, 'tua')
        }

        return NextResponse.json({ response: responseText })

    } catch (error) {
        console.error('Error generating response:', error)
        return NextResponse.json(
            { error: 'Falha ao gerar resposta' },
            { status: 500 }
        )
    }
}
