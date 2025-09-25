import { NextRequest, NextResponse } from 'next/server';
import { conversaSchema } from '@/lib/validations';
import { salvarConversa, buscarHistoricoConversas, buscarUsuarioPorId } from '@/lib/auth';

// GET - Buscar histórico de conversas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    const limite = parseInt(searchParams.get('limite') || '50');

    if (!usuarioId) {
      return NextResponse.json({
        error: 'ID do usuário é obrigatório'
      }, { status: 400 });
    }

    // Verificar se usuário existe
    const usuario = await buscarUsuarioPorId(usuarioId);
    if (!usuario) {
      return NextResponse.json({
        error: 'Usuário não encontrado'
      }, { status: 404 });
    }

    // Buscar histórico
    const conversas = await buscarHistoricoConversas(usuarioId, limite);

    return NextResponse.json({
      success: true,
      conversas
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// POST - Salvar nova conversa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados básicos
    if (!body.usuarioId) {
      return NextResponse.json({
        error: 'ID do usuário é obrigatório'
      }, { status: 400 });
    }

    // Validar texto da conversa
    const dadosValidados = conversaSchema.parse({
      textoUsuario: body.textoUsuario
    });

    // Verificar se usuário existe e está ativo
    const usuario = await buscarUsuarioPorId(body.usuarioId);
    if (!usuario) {
      return NextResponse.json({
        error: 'Usuário não encontrado'
      }, { status: 404 });
    }

    if (!usuario.contaAtiva) {
      return NextResponse.json({
        error: 'Conta não está ativa'
      }, { status: 403 });
    }

    // TODO: Aqui será integrada a resposta do ChatGPT
    // Por enquanto, usar uma resposta mock
    const textoIa = gerarRespostaMock(dadosValidados.textoUsuario);

    // TODO: Implementar análise de risco
    const riscoDetectado = analisarRisco(dadosValidados.textoUsuario);

    // Salvar conversa
    const conversa = await salvarConversa({
      usuarioId: body.usuarioId,
      textoUsuario: dadosValidados.textoUsuario,
      textoIa,
      riscoDetectado
    });

    return NextResponse.json({
      success: true,
      conversa: {
        id: conversa.id,
        dataHora: conversa.dataHora,
        textoUsuario: conversa.textoUsuario,
        textoIa: conversa.textoIa,
        riscoDetectado: conversa.riscoDetectado
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao salvar conversa:', error);

    // Erro de validação Zod
    if (error.errors) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: error.errors.map((err: any) => ({
          field: err.path[0],
          message: err.message
        }))
      }, { status: 400 });
    }

    // Erro genérico
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Função mock para gerar resposta da IA (será substituída pela integração com OpenAI)
function gerarRespostaMock(textoUsuario: string): string {
  const respostasMock = [
    "Entendo como você está se sentindo. Estou aqui para te apoiar. Pode me contar mais sobre isso?",
    "Obrigado por compartilhar isso comigo. Suas emoções são válidas e importantes.",
    "Percebo que você está passando por um momento difícil. Como posso te ajudar melhor?",
    "É normal sentir-se assim às vezes. Você não está sozinho nessa jornada.",
    "Que bom que você decidiu conversar sobre isso. Falar sobre nossos sentimentos é um passo importante."
  ];

  // Análise simples de palavras-chave para resposta mais contextual
  const textoLower = textoUsuario.toLowerCase();
  
  if (textoLower.includes('triste') || textoLower.includes('deprimido')) {
    return "Sinto muito que você esteja se sentindo triste. Esses sentimentos são difíceis, mas lembre-se de que eles são temporários. Estou aqui para te apoiar. O que tem te deixado assim?";
  }
  
  if (textoLower.includes('ansioso') || textoLower.includes('preocupado')) {
    return "A ansiedade pode ser muito desafiadora. Vamos tentar respirar juntos por um momento. Inspire profundamente... e expire devagar. Quer me contar o que está te deixando ansioso?";
  }
  
  if (textoLower.includes('sozinho') || textoLower.includes('isolado')) {
    return "Entendo que você se sinta sozinho, mas saiba que eu estou aqui com você agora. Você não está realmente sozinho. Há pessoas que se importam com você. Quer conversar sobre o que te faz sentir assim?";
  }

  // Resposta padrão aleatória
  return respostasMock[Math.floor(Math.random() * respostasMock.length)];
}

// Função mock para análise de risco (será substituída por análise mais sofisticada)
function analisarRisco(textoUsuario: string): boolean {
  const palavrasRisco = [
    'suicidio', 'suicídio', 'matar', 'morrer', 'acabar com tudo',
    'não aguento mais', 'quero desaparecer', 'sem saída',
    'não vale a pena viver', 'seria melhor morto'
  ];

  const textoLower = textoUsuario.toLowerCase();
  
  return palavrasRisco.some(palavra => textoLower.includes(palavra));
}
