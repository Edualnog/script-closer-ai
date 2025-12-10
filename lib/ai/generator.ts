import OpenAI from 'openai'

export interface GenerateScriptInput {
    productName: string
    description: string
    context: string
    leadType: 'frio' | 'morno' | 'quente'
    imageBase64?: string
}

export async function generateSalesScript(input: GenerateScriptInput) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not defined')
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `
    Você é um especialista em Copywriting e Vendas Diretas (Direct Response).
    Sua missão é criar scripts de vendas altamente persuasivos em PORTUGUÊS DO BRASIL.
    
    Estrutura de resposta JSON exata:
    {
      "mensagem_abertura": "Texto curto e engajador para iniciar a conversa",
      "roteiro_conversa": "Um guia passo-a-passo (com markdown) do que falar, perguntas para qualificar e como conduzir até o fechamento",
      "respostas_objecoes": {
        "ta_caro": "Resposta para 'está caro'",
        "vou_pensar": "Resposta para 'vou pensar'",
        "falar_com_conjuge": "Resposta para 'preciso falar com esposa/marido'",
        "concorrente": "Resposta para 'uso o do concorrente'"
      },
      "follow_up": [
        "Mensagem para enviar após 24h sem resposta",
        "Mensagem para enviar após 3 dias",
        "Mensagem de 'break-up' (última tentativa)"
      ]
    }

    Adapte o tom de voz para:
    - Lead Frio: Mais cauteloso, gere curiosidade, não venda logo de cara.
    - Lead Morno: Conecte com o problema, mostre a solução.
    - Lead Quente: Seja direto, foco em oferta e escassez.
    
    Contexto da venda: ${input.context}
  `

    const userContent: any[] = [
        {
            type: "text",
            text: `Produto: ${input.productName}\nDescrição: ${input.description}\nTipo de Lead: ${input.leadType}\n`
        }
    ]

    if (input.imageBase64) {
        // Determine the image type roughly or just assume jpeg/png header is stripped or present? 
        // The frontend usually sends data:image/jpeg;base64,... 
        // We'll pass it directly if it has the prefix, or add it if missing.
        // Ensure input.imageBase64 is the full data URL.
        const isValidDataUrl = input.imageBase64.startsWith('data:image');
        const imageUrl = isValidDataUrl
            ? input.imageBase64
            : `data:image/jpeg;base64,${input.imageBase64}`;

        userContent.push({
            type: "image_url",
            image_url: {
                url: imageUrl
            }
        })
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
        throw new Error('Falha ao gerar resposta da IA')
    }

    return JSON.parse(content)
}
