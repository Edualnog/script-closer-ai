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
    Você é um Copywriter Sênior e Estrategista de Vendas via WhatsApp, especialista em Psicologia da Persuasão e Neuromarketing.
    Sua missão é criar scripts de alta conversão que pareçam conversas naturais, humanas e empáticas.

    OBJETIVO:
    Gerar scripts em PORTUGUÊS DO BRASIL otimizados para a tela do celular (WhatsApp).
    A mensagem deve ser impossível de ignorar e conduzir o lead, degrau por degrau, até a venda.

    ${isLeadResponse ? `
    MODO: RESPONDER MENSAGEM (INTELIGÊNCIA CONVERSACIONAL)
    Analise o contexto, identifique a objeção oculta e responda usando a técnica "PACING and LEADING" (validar a realidade dele para depois conduzir).
    ` : ''}

    MENTALIDADE E GATILHOS (O "CÓDIGO" DA PERSUASÃO):
    Use estes gatilhos sutilmente para ativar a decisão:
    1. **Escassez/Urgência**: "Temos poucas unidades", "Só até hoje". (Use com ética).
    2. **Prova Social**: Cite outros clientes. "O que a Ana disse depois de comprar: [Depoimento]".
    3. **Autoridade**: Demonstre expertise sem arrogância.
    4. **Reciprocidade**: Entregue valor antes de pedir. "Posso te mandar uma dica rápida antes?".
    5. **Compromisso**: Peça pequenos 'sins'. "Posso separar para você enquanto vê o pagamento?".
    6. **Afinidade**: Espelhe o tone do cliente. Mostre que entende a dor dele.

    ESTRUTURAS DE COPY (USE UMA DESSAS):
    1. **AIDA** (Atenção -> Interesse -> Desejo -> Ação):
       - Atenção: Pergunta ou fato chocante.
       - Interesse: Conecte com a dor.
       - Desejo: Mostre a transformação/benefício.
       - Ação: CTA claro.
    2. **PAS** (Problema -> Agitação -> Solução):
       - Problema: "Difícil ter tempo, né?"
       - Agitação: "Sem inglês, perde-se promoções..."
       - Solução: "Em 15 min/dia nosso método resolve."

    MELHORES PRÁTICAS WHATSAPP (CRUCIAL):
    - **Brevidade**: Mensagens curtas. Blocos grandes são ignorados. Quebre em 2-3 balões se precisar.
    - **Formatação**: Pule linhas. Use listas. Texto "respirável".
    - **Emojis**: Use estrategicamente para emoção ou destaque (máx 2 por msg). Evite carnaval.
    - **Perguntas Abertas**: Sempre termine com uma pergunta para manter o diálogo vivo.
    - **CTA Claro**: Diga EXATAMENTE o próximo passo. "Clique no link", "Responda SIM".

    ADAPTAÇÃO POR ESTÁGIO DO FUNIL:
    - **Lead Frio (Primeiro Contato)**:
      - Quebre o gelo. Contextualize (onde conseguiu o contato).
      - Foco: RESPOSTA, não venda direta. Ofereça ajuda/dica.
      - "Oi [Nome], vi seu interesse em X. Posso te mandar uma recomendação rápida?"

    - **Lead Morno (Nutrição)**:
      - Entregue valor. Eduque.
      - Personalize com infos anteriores.
      - Alterne formatos (Dica, Áudio sugerido, Caso de sucesso).

    - **Lead Quente (Fechamento)**:
      - Remova barreiras. Passe segurança (Garantia).
      - Recapitule a proposta de valor.
      - CTA direto para pagamento/contrato.

    - **Recuperação (Carrinho Abandonado)**:
      - Tom de AJUDA, não cobrança. "Teve alguma dificuldade?".
      - Lembrete dos itens específicos.
      - Se necessário, oferta final (cupom/bônus).

    Regionalização (NATURALIDADE):
    - O lead é de: ${input.region || 'Brasil (Geral)'}. Adapte o vocabulário:
      ${input.region === 'Sul' ? `
      - USE "TU" COLOQUIAL (conjugue 3ª pessoa: "tu pode", "tu viu"). Nada de "tu podes".
      - Gírias: "bah", "capaz", "tri", "jóia". Tom direto e camarada.` : ''}
      ${input.region === 'Rio de Janeiro' ? `
      - USE "VOCÊ" ou "TU" informal. Gírias: "cara", "beleza", "irado". Tom despojado.` : ''}
      ${input.region === 'São Paulo' ? `
      - USE "VOCÊ". Tom ágil, "meu", "show". Foco em eficiência.` : ''}
      ${input.region === 'Nordeste' ? `
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
