import { NextRequest, NextResponse } from 'next/server';
import { conversaSchema } from '@/lib/validations';
import { salvarConversa, buscarUsuarioPorId, buscarHistoricoConversas } from '@/lib/auth';
import { gerarRespostaIA, analisarSentimento } from '@/lib/openai';
import { criarAlerta } from '@/lib/alertas';
import { determinarFaixaEtaria } from '@/lib/validations';

// POST - Nova conversa com OpenAI
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

    // Buscar histórico recente para contexto
    const historicoRecente = await buscarHistoricoConversas(body.usuarioId, 6);

    // Preparar contexto para a IA
    const contexto = {
      usuarioId: body.usuarioId,
      idade: usuario.idade,
      faixaEtaria: determinarFaixaEtaria(usuario.idade),
      nomeAnonimo: usuario.nomeAnonimo,
      historicoRecente: historicoRecente.map(conversa => ({
        textoUsuario: conversa.textoUsuario,
        textoIa: conversa.textoIa,
        dataHora: conversa.dataHora
      }))
    };

    // Gerar resposta com OpenAI
    const respostaIA = await gerarRespostaIA(dadosValidados.textoUsuario, contexto);

    // Analisar sentimento da mensagem do usuário
    const analiseEmocional = await analisarSentimento(dadosValidados.textoUsuario);

    // Salvar conversa no banco
    const conversa = await salvarConversa({
      usuarioId: body.usuarioId,
      textoUsuario: dadosValidados.textoUsuario,
      textoIa: respostaIA.texto,
      riscoDetectado: respostaIA.riscoDetectado
    });

    // Criar alerta se risco foi detectado
    let alertaId: string | null = null;
    if (respostaIA.riscoDetectado && respostaIA.nivelRisco) {
      try {
        // Preparar detalhes do alerta
        const detalhesAlerta = `
Risco detectado: ${respostaIA.nivelRisco}
Palavras-chave: ${respostaIA.palavrasChave?.join(', ') || 'N/A'}
Sentimento: ${analiseEmocional.sentimento} (${Math.round(analiseEmocional.confianca * 100)}% confiança)
Emoções detectadas: ${analiseEmocional.emocoes.join(', ')}

Mensagem original: "${dadosValidados.textoUsuario}"

Contexto do usuário:
- Idade: ${usuario.idade} anos
- Faixa etária: ${contexto.faixaEtaria}
- Nome: ${usuario.nomeAnonimo || 'Anônimo'}
        `.trim();

        alertaId = await criarAlerta({
          conversaId: conversa.id,
          usuarioId: body.usuarioId,
          nivelRisco: respostaIA.nivelRisco,
          detalhes: detalhesAlerta,
          palavrasChave: respostaIA.palavrasChave,
          contextoAdicional: {
            sentimento: analiseEmocional,
            faixaEtaria: contexto.faixaEtaria,
            totalConversas: historicoRecente.length
          }
        });

        console.log(`🚨 ALERTA CRIADO: ${respostaIA.nivelRisco} - Usuário: ${body.usuarioId} - Alerta: ${alertaId}`);
      } catch (alertaError) {
        console.error('Erro ao criar alerta:', alertaError);
        // Não falhar a conversa por causa do alerta
      }
    }

    return NextResponse.json({
      success: true,
      conversa: {
        id: conversa.id,
        dataHora: conversa.dataHora,
        textoUsuario: conversa.textoUsuario,
        textoIa: conversa.textoIa,
        riscoDetectado: conversa.riscoDetectado
      },
      analise: {
        risco: {
          detectado: respostaIA.riscoDetectado,
          nivel: respostaIA.nivelRisco,
          palavrasChave: respostaIA.palavrasChave,
          alertaId: alertaId
        },
        sentimento: analiseEmocional,
        recomendacoes: respostaIA.recomendacoes
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao processar conversa com OpenAI:', error);

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

    // Erro de API da OpenAI
    if (error.status === 429) {
      return NextResponse.json({
        error: 'Muitas requisições. Tente novamente em alguns segundos.',
        fallback: true
      }, { status: 429 });
    }

    if (error.status === 401) {
      return NextResponse.json({
        error: 'Erro de configuração da IA. Tente novamente mais tarde.',
        fallback: true
      }, { status: 500 });
    }

    // Erro genérico - usar fallback
    return NextResponse.json({
      error: 'Erro temporário. Usando resposta de emergência.',
      fallback: true,
      conversa: {
        textoIa: 'Desculpe, estou com dificuldades técnicas no momento. Mas quero que saiba que estou aqui para te apoiar. Seus sentimentos são importantes e válidos. Pode tentar conversar novamente em alguns minutos?',
        riscoDetectado: false
      }
    }, { status: 200 });
  }
}
