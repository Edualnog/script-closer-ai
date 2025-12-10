import OpenAI from 'openai'

export interface GenerateScriptInput {
    productName: string
    description: string
    context: string
    leadType: 'frio' | 'morno' | 'quente'
    region?: string
    imageBase64?: string
}

export async function generateSalesScript(input: GenerateScriptInput) {
    // ...

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
    
    Regionalismo Natural:
    - A região alvo é: ${input.region || 'Neutro / Geral'}
    - Use o sotaque/gírias locais de forma SUTIL e NATURAL para gerar conexão (Rapport).
    - NÃO force a barra. Se for São Paulo, use um tom mais direto, "meu", etc. Se for Rio, algo mais despojado. Se for Sul, "tchê" apenas se fizer muito sentido, prefira construções gramaticais locais.
    - O objetivo é parecer alguém da região falando, não um personagem caricato.
    
    Contexto da venda: ${input.context}
  `

    const userContent: any[] = [
        {
            type: "text",
            text: `Produto: ${input.productName}\nDescrição: ${input.description}\nTipo de Lead: ${input.leadType}\n`
        }
    ]

    if (input.imageBase64) {
        // Support both Base64 (data:image...) and Public URLs (https://...)
        const isUrl = input.imageBase64.startsWith('http');
        const isDataUrl = input.imageBase64.startsWith('data:image');

        let imageUrl = input.imageBase64;

        if (!isUrl && !isDataUrl) {
            // Assume it's a raw base64 string, append prefix
            imageUrl = `data:image/jpeg;base64,${input.imageBase64}`;
        }

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
