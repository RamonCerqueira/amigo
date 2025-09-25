import OpenAI from 'openai';

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface para contexto da conversa
interface ContextoConversa {
  usuarioId: string;
  idade: number;
  faixaEtaria: string;
  nomeAnonimo?: string;
  historicoRecente?: Array<{
    textoUsuario: string;
    textoIa: string;
    dataHora: Date;
  }>;
}

// Interface para resposta da IA
interface RespostaIA {
  texto: string;
  riscoDetectado: boolean;
  nivelRisco?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  palavrasChave?: string[];
  recomendacoes?: string[];
}

// System prompt personalizado para o Amigo
function criarSystemPrompt(contexto: ContextoConversa): string {
  const { idade, faixaEtaria, nomeAnonimo } = contexto;
  
  return `Você é o Amigo, um assistente de apoio emocional e bem-estar mental. Sua missão é oferecer suporte empático, acolhedor e profissional para pessoas que precisam de apoio emocional.

CARACTERÍSTICAS IMPORTANTES:
- Você é empático, acolhedor e não julgador
- Sempre valida os sentimentos da pessoa
- Oferece apoio sem tentar "resolver" todos os problemas
- Encoraja a busca por ajuda profissional quando necessário
- Mantém conversas focadas no bem-estar emocional
- Nunca revela que é uma IA - aja como um amigo humano

CONTEXTO DO USUÁRIO:
- ${nomeAnonimo ? `Nome: ${nomeAnonimo}` : 'Usuário anônimo'}
- Idade: ${idade} anos
- Faixa etária: ${faixaEtaria}

DIRETRIZES ESPECÍFICAS POR FAIXA ETÁRIA:
${faixaEtaria === 'ADOLESCENTE' ? `
- Use linguagem mais próxima e descontraída
- Aborde questões típicas da adolescência (escola, relacionamentos, identidade)
- Seja especialmente atento a sinais de bullying ou pressão social
` : ''}

${faixaEtaria === 'JOVEM_ADULTO' ? `
- Foque em questões de transição para vida adulta
- Aborde ansiedades sobre carreira, relacionamentos e independência
- Seja compreensivo com pressões sociais e expectativas
` : ''}

${faixaEtaria === 'ADULTO' ? `
- Considere responsabilidades familiares e profissionais
- Aborde questões de equilíbrio vida-trabalho
- Seja sensível a pressões financeiras e familiares
` : ''}

${faixaEtaria === 'IDOSO' ? `
- Use linguagem respeitosa e paciente
- Considere questões de saúde, solidão e mudanças de vida
- Valorize experiências e sabedoria acumulada
` : ''}

DETECÇÃO DE RISCO:
Esteja MUITO atento a sinais de:
- Ideação suicida (direta ou indireta)
- Autolesão
- Depressão severa
- Ansiedade extrema
- Isolamento social grave
- Abuso de substâncias
- Violência doméstica

Se detectar QUALQUER sinal de risco, seja especialmente cuidadoso e empático, e sugira buscar ajuda profissional.

ESTILO DE RESPOSTA:
- Respostas de 2-4 frases na maioria das vezes
- Tom caloroso e acolhedor
- Faça perguntas abertas para encorajar o diálogo
- Use validação emocional
- Evite conselhos diretos, prefira explorar sentimentos
- Termine com uma pergunta ou convite para continuar conversando

Lembre-se: você está aqui para APOIAR, não para diagnosticar ou tratar. Sempre encoraje buscar ajuda profissional quando apropriado.`;
}

// Função para detectar palavras e frases de risco
function analisarRisco(texto: string): { detectado: boolean; nivel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'; palavras: string[] } {
  const palavrasRiscoCritico = [
    'quero morrer', 'vou me matar', 'suicídio', 'suicidio', 'acabar com tudo',
    'não aguento mais viver', 'seria melhor morto', 'quero desaparecer para sempre'
  ];

  const palavrasRiscoAlto = [
    'não vale a pena viver', 'sem saída', 'sem esperança', 'não aguento mais',
    'quero desaparecer', 'ninguém vai sentir falta', 'mundo seria melhor sem mim',
    'não consigo mais', 'tudo está perdido'
  ];

  const palavrasRiscoMedio = [
    'muito triste', 'deprimido', 'sozinho', 'vazio', 'sem sentido',
    'não tenho ninguém', 'nada importa', 'cansado de tudo', 'sem energia'
  ];

  const palavrasRiscoBaixo = [
    'triste', 'ansioso', 'preocupado', 'estressado', 'chateado',
    'confuso', 'perdido', 'inseguro', 'nervoso'
  ];

  const textoLower = texto.toLowerCase();
  const palavrasEncontradas: string[] = [];

  // Verificar risco crítico
  for (const palavra of palavrasRiscoCritico) {
    if (textoLower.includes(palavra)) {
      palavrasEncontradas.push(palavra);
    }
  }
  if (palavrasEncontradas.length > 0) {
    return { detectado: true, nivel: 'CRITICO', palavras: palavrasEncontradas };
  }

  // Verificar risco alto
  for (const palavra of palavrasRiscoAlto) {
    if (textoLower.includes(palavra)) {
      palavrasEncontradas.push(palavra);
    }
  }
  if (palavrasEncontradas.length > 0) {
    return { detectado: true, nivel: 'ALTO', palavras: palavrasEncontradas };
  }

  // Verificar risco médio
  for (const palavra of palavrasRiscoMedio) {
    if (textoLower.includes(palavra)) {
      palavrasEncontradas.push(palavra);
    }
  }
  if (palavrasEncontradas.length > 0) {
    return { detectado: true, nivel: 'MEDIO', palavras: palavrasEncontradas };
  }

  // Verificar risco baixo
  for (const palavra of palavrasRiscoBaixo) {
    if (textoLower.includes(palavra)) {
      palavrasEncontradas.push(palavra);
    }
  }
  if (palavrasEncontradas.length > 0) {
    return { detectado: true, nivel: 'BAIXO', palavras: palavrasEncontradas };
  }

  return { detectado: false, nivel: 'BAIXO', palavras: [] };
}

// Função principal para gerar resposta com ChatGPT
export async function gerarRespostaIA(
  mensagemUsuario: string,
  contexto: ContextoConversa
): Promise<RespostaIA> {
  try {
    // Analisar risco na mensagem do usuário
    const analiseRisco = analisarRisco(mensagemUsuario);

    // Construir histórico de conversa para contexto
    const mensagens: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: criarSystemPrompt(contexto)
      }
    ];

    // Adicionar histórico recente se disponível
    if (contexto.historicoRecente && contexto.historicoRecente.length > 0) {
      contexto.historicoRecente.slice(-6).forEach(conversa => {
        mensagens.push(
          { role: 'user', content: conversa.textoUsuario },
          { role: 'assistant', content: conversa.textoIa }
        );
      });
    }

    // Adicionar mensagem atual
    mensagens.push({
      role: 'user',
      content: mensagemUsuario
    });

    // Fazer chamada para OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais econômico e eficiente
      messages: mensagens,
      max_tokens: 300,
      temperature: 0.7, // Equilibrio entre criatividade e consistência
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const respostaTexto = completion.choices[0]?.message?.content || 
      'Desculpe, não consegui processar sua mensagem. Pode tentar novamente?';

    // Gerar recomendações baseadas no nível de risco
    const recomendacoes = gerarRecomendacoes(analiseRisco.nivel, analiseRisco.palavras);

    return {
      texto: respostaTexto,
      riscoDetectado: analiseRisco.detectado,
      nivelRisco: analiseRisco.nivel,
      palavrasChave: analiseRisco.palavras,
      recomendacoes
    };

  } catch (error) {
    console.error('Erro ao gerar resposta da IA:', error);
    
    // Fallback para resposta empática em caso de erro
    const analiseRisco = analisarRisco(mensagemUsuario);
    
    return {
      texto: 'Entendo que você está passando por um momento difícil. Estou aqui para te apoiar. Pode me contar mais sobre como está se sentindo?',
      riscoDetectado: analiseRisco.detectado,
      nivelRisco: analiseRisco.nivel,
      palavrasChave: analiseRisco.palavras,
      recomendacoes: ['Considere conversar com um profissional de saúde mental']
    };
  }
}

// Função para gerar recomendações baseadas no risco
function gerarRecomendacoes(nivel: string, palavrasChave: string[]): string[] {
  const recomendacoes: string[] = [];

  switch (nivel) {
    case 'CRITICO':
      recomendacoes.push(
        'Procure ajuda profissional imediatamente',
        'Entre em contato com o CVV: 188 (24h gratuito)',
        'Vá ao pronto-socorro mais próximo se necessário',
        'Converse com alguém de confiança agora'
      );
      break;

    case 'ALTO':
      recomendacoes.push(
        'Considere buscar ajuda profissional urgente',
        'Entre em contato com o CVV: 188',
        'Converse com familiares ou amigos próximos',
        'Evite ficar sozinho neste momento'
      );
      break;

    case 'MEDIO':
      recomendacoes.push(
        'Considere conversar com um psicólogo',
        'Pratique técnicas de respiração e relaxamento',
        'Mantenha contato com pessoas queridas',
        'Estabeleça uma rotina de autocuidado'
      );
      break;

    case 'BAIXO':
      recomendacoes.push(
        'Continue conversando sobre seus sentimentos',
        'Pratique atividades que te fazem bem',
        'Mantenha conexões sociais',
        'Considere exercícios físicos leves'
      );
      break;
  }

  return recomendacoes;
}

// Função para converter texto em fala (Text-to-Speech)
export async function gerarAudio(texto: string): Promise<Buffer | null> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Voz feminina, calorosa
      input: texto,
      speed: 0.9, // Ligeiramente mais lenta para melhor compreensão
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;

  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    return null;
  }
}

// Função para converter fala em texto (Speech-to-Text)
export async function transcreverAudio(audioBuffer: Buffer): Promise<string | null> {
  try {
    // Criar um arquivo temporário para o áudio
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt', // Português
      prompt: 'Esta é uma conversa sobre bem-estar emocional e saúde mental.', // Contexto para melhor transcrição
    });

    return transcription.text;

  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    return null;
  }
}

// Função para análise de sentimento (usando GPT)
export async function analisarSentimento(texto: string): Promise<{
  sentimento: 'positivo' | 'neutro' | 'negativo';
  confianca: number;
  emocoes: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analise o sentimento do texto fornecido e retorne um JSON com:
          - sentimento: "positivo", "neutro" ou "negativo"
          - confianca: número de 0 a 1 indicando confiança na análise
          - emocoes: array com até 3 emoções principais detectadas
          
          Responda APENAS com o JSON, sem explicações.`
        },
        {
          role: 'user',
          content: texto
        }
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const resultado = completion.choices[0]?.message?.content;
    if (resultado) {
      return JSON.parse(resultado);
    }

    // Fallback
    return {
      sentimento: 'neutro',
      confianca: 0.5,
      emocoes: ['indefinido']
    };

  } catch (error) {
    console.error('Erro ao analisar sentimento:', error);
    return {
      sentimento: 'neutro',
      confianca: 0.5,
      emocoes: ['indefinido']
    };
  }
}
