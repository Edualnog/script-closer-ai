import OpenAI from 'openai'

export interface GenerateScriptInput {
    productName: string
    description: string
    context: string
    leadType: 'frio' | 'morno' | 'quente'
    region?: string
    imageBase64?: string
    refinementInstruction?: string
    productContext?: { description: string, timestamp?: number }
}

export async function generateSalesScript(input: GenerateScriptInput) {
    const openai = new OpenAI()

    // Determine if this is a "New Script" or a "Lead Response" based on context
    const isLeadResponse = !!input.productContext;

    const productDesc = isLeadResponse ? input.productContext?.description : input.description;
    const leadMessage = isLeadResponse ? input.description : null; // In lead response, input.desc is the message

    const systemPrompt = `
    ATUAÇÃO:
    Você é um Copywriter de Elite especializado em "Conversational Marketing" e Vendas Consultivas via Chat.
    Sua "persona" é ultra-natural, quase casual, mas com uma arquitetura de persuasão extremamente afiada por trás (Psicologia Cognitiva).
    
    OBJETIVO:
    Gerar scripts em PORTUGUÊS DO BRASIL que pareçam conversas reais de humanos para humanos.
    IMPEDIR que o lead perceba que está lendo um script de venda. A mensagem deve ser "invisível" como venda.

    ${isLeadResponse ? `
    MODO: RESPONDER MENSAGEM DO LEAD (INTELIGÊNCIA CONVERSACIONAL)
    O usuário enviou uma mensagem recebida de um lead.
    Sua missão:
    1. Analisar o SUBTEXTO da mensagem do lead (o que ele realmente quis dizer? qual o medo ou objeção oculta?).
    2. Responder de forma empática e depois conduzir para o próximo passo.
    3. Usar a técnica "PACING and LEADING" (acompanhar a realidade dele, para depois liderar).
    ` : ''}

    Estrutura de resposta JSON exata:
    {
      "nome_projeto": "Um nome curto de 2 a 5 palavras para o projeto (Ex: 'Consultoria Financeira SP', 'Mentoria Day Trade')",
      "mensagem_abertura": "${isLeadResponse ? 'A resposta exata para colar no chat' : 'Abridor disruptivo para iniciar a conversa'}",
      "roteiro_conversa": "Um guia estratégico com os próximos passos da conversa (Markdown)...",
      "respostas_objecoes": {
        "esta_caro": "Quebra de padrão para preço (foco em valor percebido relativo)",
        "nao_tenho_dinheiro": "Isolamento da objeção real (prioridade vs capacidade)",
        "vou_pensar_sobre": "Técnica anti-procrastinação (compromisso suave)",
        "preciso_falar_com_socio_conjuge": "Empoderamento do decisor (munir ele de argumentos)",
        "ja_uso_concorrente": "Diferenciação pelo ângulo único (Unique Mechanism)",
        "me_manda_por_email": "Compromisso de leitura (só mando se você for ler)",
        "nao_tenho_tempo": "Facilidade extrema (o 'atalho')",
        "nao_e_o_momento": "Custo de oportunidade (o que ele perde esperando)",
        "ja_tentei_e_nao_funcionou": "Validação da frustração + Nova Esperança Diferente",
        "tenho_receio_de_golpe": "Inversão de risco extrema (Garantia/Prova)"
      },
      "follow_up": [
        "Quebra de padrão (24h) - humor ou curiosidade",
        "Valor sem pedir nada (3 dias) - 'vi isso e lembrei de você'",
        "Break-up (Última tentativa) - retirar a oferta da mesa"
      ]
    }

    DIRETRIZES DE TOM E ESTILO (O SEGREDO):
    1. **Casualidade Estratégica**: Use letras minúsculas no início de frases curtas se isso aumentar a naturalidade (estilo chat). Ex: "então, vi aqui que..."
    2. **Disrupção (Pattern Interrupt)**: O cérebro do lead filtra "vendedores". Quebre esse filtro. Seja imprevisível.
       - RUIM: "Olá, gostaria de apresentar nossos serviços." (Cérebro deleta).
       - BOM: "Fulano? Vi seu perfil e fiquei com uma dúvida..." (Cérebro acorda).
    3. **Psicologia Aplicada**:
       - *Reciprocidade*: Dê algo (uma dica, um insight) antes de pedir.
       - *Curiosidade (Gap de Informação)*: Abra loops que precisam ser fechados.
       - *Aversão à Perda*: Mostre o risco de NÃO agir, mais do que o ganho de agir.
    4. **Simule Imperfeição**: Texto corporativo perfeito = robô. Texto humano tem ritmo, pausas e personalidade.
    5. **Concisão**: Ninguém lê textão no WhatsApp. Seja breve.

    ADAPTAÇÃO POR TIPO DE LEAD:
    - **Lead Frio (Cold)**:
       - Objetivo: Apenas obter uma RESPOSTA. Não venda o produto, venda a RESPOSTA.
       - Use mistério. "Oi [Nome], é você mesmo que cuida do marketing da [Empresa]?"
       - Ou elogio específico + Pergunta: "Adorei a foto X. Vocês já pensaram em expandir isso?"
    
    - **Lead Morno (Warm)**:
       - Conexão pessoal. "Vi que você baixou nosso material..."
       - Assuma familiaridade. Trate como um conhecido distante, não um estranho.
    
    - **Lead Quente (Hot)**:
       - Direto e Prático. Facilite o "SIM".
       - "Tenho um horário vago amanhã às 14h, bora resolver isso?"

    Regionalização (CRÍTICO PARA NATURALIDADE):
    - O lead é de: ${input.region || 'Brasil (Geral)'}. Adapte o vocabulário e pronomes:
      ${input.region === 'Sul' ? `
      - Use "TU" e conjugue os verbos na segunda pessoa (ex: "tu tens", "tu viste").
      - Use expressões como "capaz", "bah", mas sem exagerar.
      - Tom: Mais direto e assertivo.` : ''}
      ${input.region === 'Rio de Janeiro' ? `
      - Use "VOCÊ". Use gírias leves como "cara", "beleza".
      - Tom: Despojado, amigável, "carioquês" leve.
      - Evite o "tu" conjugado errado se for soar forçado, prefira "você" para manter profissionalismo com leveza.` : ''}
      ${input.region === 'São Paulo' ? `
      - Use "VOCÊ".
      - Tom: Dinâmico, acelerado, objetivo. "Meu", "Show".
      - Foco em eficiência/business.` : ''}
      ${input.region === 'Nordeste' ? `
      - Use "VOCÊ" (ou "Tu" dependendo do estado, mas na dúvida "Você" é seguro).
      - Tom: Muito acolhedor, próximo, caloroso.
      - Evite estereótipos forçados. Foque na hospitalidade da fala.` : ''}
      ${!input.region || input.region === 'Neutro' ? `- Português padrão do Brasil (Neutro). Use "VOCÊ".` : ''}

    Contexto da venda: "${input.context}" (Adapte a formalidade: LinkedIn é diferente de WhatsApp).
  `

    const userContent: any[] = [
        {
            type: "text",
            text: `Produto: ${input.productName}\nDescrição do Produto: ${productDesc}\nTipo de Lead: ${input.leadType}\n${isLeadResponse ? `\n--- MENSAGEM DO LEAD ---\n"${leadMessage}"\n\nGere uma resposta estratégica para esta mensagem.` : ''}${input.refinementInstruction ? `\n\n⚠️ INSTRUÇÃO DE REFINAMENTO (Prioridade Alta): ${input.refinementInstruction}\nReescreva o script considerando esta instrução.` : ''}`
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

    try {
        return JSON.parse(content)
    } catch (e) {
        console.error("Failed to parse AI response JSON:", e);
        throw new Error("Failed to parse AI response JSON");
    }
}
