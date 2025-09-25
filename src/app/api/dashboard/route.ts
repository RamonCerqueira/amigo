import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buscarUsuarioPorId } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

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

    // Buscar estatísticas do usuário
    const [
      totalConversas,
      conversasHoje,
      conversasSemana,
      ultimasConversas,
      alertasAtivos
    ] = await Promise.all([
      // Total de conversas
      prisma.conversa.count({
        where: { usuarioId }
      }),

      // Conversas hoje
      prisma.conversa.count({
        where: {
          usuarioId,
          dataHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Conversas na última semana
      prisma.conversa.count({
        where: {
          usuarioId,
          dataHora: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Últimas 5 conversas
      prisma.conversa.findMany({
        where: { usuarioId },
        orderBy: { dataHora: 'desc' },
        take: 5,
        select: {
          id: true,
          dataHora: true,
          textoUsuario: true,
          textoIa: true,
          riscoDetectado: true
        }
      }),

      // Alertas ativos
      prisma.alerta.count({
        where: {
          usuarioId,
          status: {
            in: ['PENDENTE', 'EM_ANALISE']
          }
        }
      })
    ]);

    // Estatísticas por faixa etária (para comparação)
    const estatisticasFaixaEtaria = await prisma.conversa.groupBy({
      by: ['faixaEtaria'],
      _count: {
        id: true
      },
      where: {
        dataHora: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Último mês
        }
      }
    });

    // Conversas por dia da semana (últimos 7 dias)
    const conversasPorDia = await prisma.$queryRaw`
      SELECT 
        DATE(data_hora) as dia,
        COUNT(*) as total
      FROM conversas 
      WHERE usuario_id = ${usuarioId}
        AND data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(data_hora)
      ORDER BY dia DESC
    ` as Array<{ dia: string; total: bigint }>;

    // Análise de sentimentos (mock - será implementado com IA)
    const analiseHumor = {
      positivo: Math.floor(Math.random() * 40) + 30, // 30-70%
      neutro: Math.floor(Math.random() * 30) + 20,   // 20-50%
      negativo: Math.floor(Math.random() * 20) + 10  // 10-30%
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nomeAnonimo: usuario.nomeAnonimo,
          idade: usuario.idade
        },
        estatisticas: {
          totalConversas,
          conversasHoje,
          conversasSemana,
          alertasAtivos
        },
        ultimasConversas,
        graficos: {
          conversasPorDia: conversasPorDia.map(item => ({
            dia: item.dia,
            total: Number(item.total)
          })),
          estatisticasFaixaEtaria,
          analiseHumor
        },
        recomendacoes: gerarRecomendacoes(totalConversas, conversasHoje, alertasAtivos)
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao buscar dashboard:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Função para gerar recomendações personalizadas
function gerarRecomendacoes(totalConversas: number, conversasHoje: number, alertasAtivos: number) {
  const recomendacoes = [];

  if (conversasHoje === 0) {
    recomendacoes.push({
      tipo: 'conversa',
      titulo: 'Que tal uma conversa hoje?',
      descricao: 'Você ainda não conversou hoje. Estou aqui para te apoiar.',
      acao: 'Iniciar conversa'
    });
  }

  if (totalConversas < 5) {
    recomendacoes.push({
      tipo: 'exploracao',
      titulo: 'Explore mais funcionalidades',
      descricao: 'Descubra como posso te ajudar melhor em sua jornada de bem-estar.',
      acao: 'Ver dicas'
    });
  }

  if (alertasAtivos > 0) {
    recomendacoes.push({
      tipo: 'suporte',
      titulo: 'Suporte especializado disponível',
      descricao: 'Nossa equipe está acompanhando seu bem-estar. Considere conversar com um profissional.',
      acao: 'Contatar equipe'
    });
  }

  // Recomendação padrão
  if (recomendacoes.length === 0) {
    recomendacoes.push({
      tipo: 'bem_estar',
      titulo: 'Continue cuidando de si',
      descricao: 'Você está no caminho certo. Continue conversando e cuidando do seu bem-estar.',
      acao: 'Nova conversa'
    });
  }

  return recomendacoes;
}
