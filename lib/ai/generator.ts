import OpenAI from 'openai'

export interface GenerateScriptInput {
  productName: string
  description: string
  context: string
  leadType: 'frio' | 'morno' | 'quente'
  leadOrigin?: 'inbound' | 'outbound' // New field
  region?: string
  imageBase64?: string
  refinementInstruction?: string
  productContext?: { description: string, timestamp?: number }
}

export async function generateSalesScript(input: GenerateScriptInput) {
  const openai = new OpenAI()

  // Determine if this is a "New Script" or a "Lead Response" based on context
  const isLeadResponse = !!input.productContext;
  const origin = input.leadOrigin || 'inbound';

  const productDesc = isLeadResponse ? input.productContext?.description : input.description;
  const leadMessage = isLeadResponse ? input.description : null; // In lead response, input.desc is the message

  const originInstructions = origin === 'inbound' ? `
    - CONTEXTO: O lead enviou a mensagem: "Tenho interesse no [Produto]".
    - A 'mensagem_abertura' deve ser uma resposta natural de um humano, NÃO de um robô ou empresa.
    - 🚫 PROIBIDO USAR: "É um prazer te atender", "Recebi seu contato", "Gostaria de apresentar".
    - POSTURA: Amigável, direta e conversacional.
    - Abertura: Cumprimente, valide o interesse com entusiasmo genuíno e faça uma pergunta simples para engajar.
    - Ex: "Opa [Nome], tudo bom? Maravilha! O [Produto] é excelente mesmo. Você já conhece como ele funciona ou prefere que eu explique rapidinho?"
  ` : `
    - POSTURA: "Pattern Interrupt" (Quebra de Padrão).
    - O lead NÃO espera seu contato. Você precisa ganhar o direito de falar em 3 segundos.
    - Abertura: NUNCA comece com "Oi, tudo bem?". É ignorado.
    - Use: Mencione um problema específico, uma conexão em comum ou uma curiosidade. Peça permissão.
    - Ex: "Oi [Nome], desculpe a intromissão. Vi seu perfil e notei [Algo Específico]..."
  `;

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

    ORIGEM DO CONTATO (CRUCIAL):
    Este lead é: ${origin === 'inbound' ? 'INBOUND (O cliente procurou a empresa)' : 'OUTBOUND (A empresa abordou o cliente)'}.
    ${originInstructions}

    MENTALIDADE E GATILHOS(O "CÓDIGO" DA PERSUASÃO):
    Use estes gatilhos sutilmente para ativar a decisão:
1. ** Escassez / Urgência **: "Temos poucas unidades", "Só até hoje". (Use com ética).
    2. ** Prova Social **: Cite outros clientes. "O que a Ana disse depois de comprar: [Depoimento]".
    3. ** Autoridade **: Demonstre expertise sem arrogância.
    4. ** Reciprocidade **: Entregue valor antes de pedir. "Posso te mandar uma dica rápida antes?".
    5. ** Compromisso **: Peça pequenos 'sins'. "Posso separar para você enquanto vê o pagamento?".
    6. ** Afinidade **: Espelhe o tone do cliente.Mostre que entende a dor dele.

    ESTRUTURAS DE COPY(USE UMA DESSAS):
1. ** AIDA ** (Atenção -> Interesse -> Desejo -> Ação):
- Atenção: Pergunta ou fato chocante.
       - Interesse: Conecte com a dor.
       - Desejo: Mostre a transformação / benefício.
       - Ação: CTA claro.
    2. ** PAS ** (Problema -> Agitação -> Solução):
- Problema: "Difícil ter tempo, né?"
  - Agitação: "Sem inglês, perde-se promoções..."
    - Solução: "Em 15 min/dia nosso método resolve."

    MELHORES PRÁTICAS WHATSAPP(CRUCIAL):
    - ** Brevidade **: Mensagens curtas.Blocos grandes são ignorados.Quebre em 2 - 3 balões se precisar.
    - ** Formatação **: Pule linhas.Use listas.Texto "respirável".
    - ** Emojis **: Use estrategicamente para emoção ou destaque(máx 2 por msg).Evite carnaval.
    - ** Perguntas Abertas **: Sempre termine com uma pergunta para manter o diálogo vivo.
    - ** CTA Claro **: Diga EXATAMENTE o próximo passo. "Clique no link", "Responda SIM".

    ADAPTAÇÃO POR ESTÁGIO DO FUNIL:
    - ** Lead Frio(Primeiro Contato) **:
- Quebre o gelo.Contextualize(onde conseguiu o contato).
      - Foco: RESPOSTA, não venda direta.Ofereça ajuda / dica.
      - "Oi [Nome], vi seu interesse em X. Posso te mandar uma recomendação rápida?"

  - ** Lead Morno(Nutrição) **:
- Entregue valor.Eduque.
      - Personalize com infos anteriores.
      - Alterne formatos(Dica, Áudio sugerido, Caso de sucesso).

    - ** Lead Quente(Fechamento) **:
- Remova barreiras.Passe segurança(Garantia).
      - Recapitule a proposta de valor.
      - CTA direto para pagamento / contrato.

    - ** Recuperação(Carrinho Abandonado) **:
- Tom de AJUDA, não cobrança. "Teve alguma dificuldade?".
      - Lembrete dos itens específicos.
      - Se necessário, oferta final(cupom / bônus).

  Regionalização(NATURALIDADE):
- O lead é de: ${input.region || 'Brasil (Geral)'}. Adapte o vocabulário:
      ${input.region === 'Sul' ? `
      - Use "TU" conjugado na 3ª pessoa ("tu viu", "tu consegue") de forma natural.
      - Evite exageros. Use expressões como "bah" ou "capaz" apenas se encaixar muito bem no contexto.` : ''
    }
      ${input.region === 'Rio de Janeiro' ? `
      - Use um tom despojado e direto (\`você\`/\`tu\`).
      - Gírias leves("beleza", "tranquilo") apenas para conexão, sem forçar.` : ''
    }
      ${input.region === 'São Paulo' ? `
      - Tom prático, ágil e focado (\`meu\` ocasional, mas foco na eficiência).` : ''
    }
      ${input.region === 'Nordeste' ? `
      - Tom acolhedor e próximo. Foco na hospitalidade, sem estereótipos forçados.` : ''
    }
      ${!input.region || input.region === 'Neutro' ? `- Português padrão do Brasil (Neutro). Use "VOCÊ".` : ''}

    Contexto da venda: "${input.context}"(Adapte a formalidade: LinkedIn é diferente de WhatsApp).

    FORMATO DE SAÍDA(Obrigatório JSON):
    Você deve responder APENAS com um objeto JSON válido, sem markdown, contendo:
{
  "mensagem_abertura": "Se Inbound: Resposta acolhedora ao 'Oi' do lead. Se Outbound: Quebra-gelo para iniciar a conversa.",
    "roteiro_conversa": "O script principal passo a passo (Passo 1, Passo 2...), focado na conversão.",
      "respostas_objecoes": {
        "preco_alto": "Argumento para 'tá caro'",
        "vou_pensar": "Argumento para 'vou ver com esposa/sócio'",
        "confianca": "Argumento para 'será que funciona?'",
        "concorrente": "Argumento para 'uso o do fulano'",
        "agora_nao": "Argumento para 'vê mais pra frente'",
        "decisor": "Argumento para 'preciso falar com o diretor'"
      },
  "follow_up": ["Opção 1 de mensagem para retomar contato amanhã", "Opção 2 para 3 dias depois"]
}
`

  const userContent: any[] = [
    {
      type: "text",
      text: `Produto: ${input.productName} \nDescrição do Produto: ${productDesc}\nTipo de Lead: ${input.leadType} \n${isLeadResponse ? `\n--- MENSAGEM DO LEAD ---\n"${leadMessage}"\n\nGere uma resposta estratégica para esta mensagem.` : ''}${input.refinementInstruction ? `\n\n⚠️ INSTRUÇÃO DE REFINAMENTO (Prioridade Alta): ${input.refinementInstruction}\nReescreva o script considerando esta instrução.` : ''} `
    }
  ]

  if (input.imageBase64) {
    // Support both Base64 (data:image...) and Public URLs (https://...)
    const isUrl = input.imageBase64.startsWith('http');
    const isDataUrl = input.imageBase64.startsWith('data:image');

    let imageUrl = input.imageBase64;

    if (!isUrl && !isDataUrl) {
      // Assume it's a raw base64 string, append prefix
      imageUrl = `data: image / jpeg; base64, ${input.imageBase64} `;
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

// New function: Generate dynamic follow-ups based on conversation context
export interface GenerateFollowUpsInput {
  productName: string;
  productDescription: string;
  conversationHistory: Array<{ type: 'you' | 'lead'; content: string }>;
  lastMessageTime?: string; // ISO timestamp
}

export async function generateFollowUps(input: GenerateFollowUpsInput) {
  const openai = new OpenAI()

  const conversationSummary = input.conversationHistory.length > 0
    ? input.conversationHistory.map((msg, i) =>
      `${msg.type === 'you' ? 'Você' : 'Lead'}: "${msg.content}"`
    ).join('\n')
    : 'Nenhuma conversa ainda (lead não respondeu à abertura)';

  const systemPrompt = `
    Você é um especialista em vendas via WhatsApp.
    
    CONTEXTO:
    - Produto: ${input.productName}
    - Descrição: ${input.productDescription}
    - Histórico da conversa:
    ${conversationSummary}
    
    OBJETIVO:
    Gere 3 mensagens de follow-up PERSONALIZADAS para reengajar este lead específico.
    Cada mensagem deve ser progressivamente mais direta mas sempre respeitosa.
    
    REGRAS:
    - Mensagem 1 (24h depois): Leve, curiosidade, retomar assunto específico da conversa
    - Mensagem 2 (48h depois): Agregar valor, enviar dica/insight relacionado
    - Mensagem 3 (72h depois): Último contato, oferecer ajuda ou encerrar cordialmente
    
    - Use o CONTEXTO da conversa - mencione algo específico que foi discutido
    - Seja natural, não robótico
    - Mensagens curtas (2-3 linhas máximo)
    - Termine com pergunta quando possível
    
    FORMATO DE SAÍDA (JSON obrigatório):
    {
      "followups": [
        { "timing": "24h", "message": "texto da mensagem 1" },
        { "timing": "48h", "message": "texto da mensagem 2" },
        { "timing": "72h", "message": "texto da mensagem 3" }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Gere os follow-ups personalizados para este contexto." }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('Falha ao gerar follow-ups')
  }

  return JSON.parse(content)
}

