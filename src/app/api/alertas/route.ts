import { NextRequest, NextResponse } from 'next/server';
import { 
  buscarAlertasPendentes, 
  atualizarStatusAlerta, 
  obterEstatisticasAlertas,
  buscarHistoricoAlertasUsuario 
} from '@/lib/alertas';

// GET - Buscar alertas pendentes ou estatísticas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const usuarioId = searchParams.get('usuarioId');
    const limite = parseInt(searchParams.get('limite') || '50');

    // Buscar estatísticas
    if (tipo === 'estatisticas') {
      const estatisticas = await obterEstatisticasAlertas();
      return NextResponse.json({
        success: true,
        estatisticas
      }, { status: 200 });
    }

    // Buscar histórico de um usuário específico
    if (tipo === 'historico' && usuarioId) {
      const historico = await buscarHistoricoAlertasUsuario(usuarioId);
      return NextResponse.json({
        success: true,
        alertas: historico
      }, { status: 200 });
    }

    // Buscar alertas pendentes (padrão)
    const alertas = await buscarAlertasPendentes(limite);

    // Formatar dados para resposta
    const alertasFormatados = alertas.map(alerta => ({
      id: alerta.id,
      nivelRisco: alerta.nivelRisco,
      status: alerta.status,
      dataHora: alerta.dataHora,
      detalhes: alerta.detalhes,
      usuario: {
        id: alerta.usuario.id,
        nomeAnonimo: alerta.usuario.nomeAnonimo,
        idade: alerta.usuario.idade,
        email: alerta.usuario.email // Apenas para equipe de apoio
      },
      conversa: {
        textoUsuario: alerta.conversa.textoUsuario,
        textoIa: alerta.conversa.textoIa,
        dataHora: alerta.conversa.dataHora,
        faixaEtaria: alerta.conversa.faixaEtaria
      }
    }));

    return NextResponse.json({
      success: true,
      alertas: alertasFormatados,
      total: alertas.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao buscar alertas:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// PUT - Atualizar status de alerta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertaId, novoStatus, observacoes } = body;

    if (!alertaId || !novoStatus) {
      return NextResponse.json({
        error: 'ID do alerta e novo status são obrigatórios'
      }, { status: 400 });
    }

    // Validar status
    const statusValidos = ['PENDENTE', 'EM_ANALISE', 'RESOLVIDO'];
    if (!statusValidos.includes(novoStatus)) {
      return NextResponse.json({
        error: 'Status inválido'
      }, { status: 400 });
    }

    const sucesso = await atualizarStatusAlerta(alertaId, novoStatus, observacoes);

    if (!sucesso) {
      return NextResponse.json({
        error: 'Erro ao atualizar alerta'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Status do alerta atualizado com sucesso'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao atualizar alerta:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
