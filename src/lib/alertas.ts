import { prisma } from './prisma';
import { NivelRisco, StatusAlerta } from '@prisma/client';

// Interface para dados do alerta
interface DadosAlerta {
  conversaId: string;
  usuarioId: string;
  nivelRisco: NivelRisco;
  detalhes: string;
  palavrasChave?: string[];
  contextoAdicional?: never;
}

// Interface para notificação
interface NotificacaoAlerta {
  alertaId: string;
  nivelRisco: NivelRisco;
  usuario: {
    id: string;
    nomeAnonimo?: string;
    idade: number;
    faixaEtaria: string;
  };
  conversa: {
    textoUsuario: string;
    textoIa: string;
    dataHora: Date;
  };
  detalhes: string;
  palavrasChave?: string[];
}

// Função para criar alerta
export async function criarAlerta(dados: DadosAlerta): Promise<string> {
  try {
    const alerta = await prisma.alerta.create({
      data: {
        conversaId: dados.conversaId,
        usuarioId: dados.usuarioId,
        nivelRisco: dados.nivelRisco,
        status: 'PENDENTE',
        detalhes: dados.detalhes
      }
    });

    // Enviar notificação para equipe de apoio
    await enviarNotificacaoEquipe(alerta.id);

    // Log do alerta criado
    console.log(`🚨 ALERTA CRIADO: ${dados.nivelRisco} - Usuário: ${dados.usuarioId} - ID: ${alerta.id}`);

    return alerta.id;
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    throw error;
  }
}

// Função para buscar alertas pendentes
export async function buscarAlertasPendentes(limite: number = 50) {
  try {
    const alertas = await prisma.alerta.findMany({
      where: {
        status: {
          in: ['PENDENTE', 'EM_ANALISE']
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nomeAnonimo: true,
            idade: true,
            email: true
          }
        },
        conversa: {
          select: {
            textoUsuario: true,
            textoIa: true,
            dataHora: true,
            faixaEtaria: true
          }
        }
      },
      orderBy: [
        { nivelRisco: 'desc' }, // CRITICO primeiro
        { dataHora: 'desc' }
      ],
      take: limite
    });

    return alertas;
  } catch (error) {
    console.error('Erro ao buscar alertas pendentes:', error);
    return [];
  }
}

// Função para atualizar status do alerta
export async function atualizarStatusAlerta(
  alertaId: string, 
  novoStatus: StatusAlerta,
  observacoes?: string
): Promise<boolean> {
  try {
    await prisma.alerta.update({
      where: { id: alertaId },
      data: {
        status: novoStatus,
        // TODO: Adicionar campo observacoes no schema se necessário
      }
    });

    console.log(`📝 Alerta ${alertaId} atualizado para: ${novoStatus}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do alerta:', error);
    return false;
  }
}

// Função para buscar histórico de alertas de um usuário
export async function buscarHistoricoAlertasUsuario(usuarioId: string) {
  try {
    const alertas = await prisma.alerta.findMany({
      where: { usuarioId },
      include: {
        conversa: {
          select: {
            textoUsuario: true,
            dataHora: true
          }
        }
      },
      orderBy: { dataHora: 'desc' },
      take: 20
    });

    return alertas;
  } catch (error) {
    console.error('Erro ao buscar histórico de alertas:', error);
    return [];
  }
}

// Função para obter estatísticas de alertas
export async function obterEstatisticasAlertas() {
  try {
    const [
      totalAlertas,
      alertasPendentes,
      alertasEmAnalise,
      alertasResolvidos,
      alertasPorNivel,
      alertasUltimos7Dias
    ] = await Promise.all([
      // Total de alertas
      prisma.alerta.count(),

      // Alertas pendentes
      prisma.alerta.count({
        where: { status: 'PENDENTE' }
      }),

      // Alertas em análise
      prisma.alerta.count({
        where: { status: 'EM_ANALISE' }
      }),

      // Alertas resolvidos
      prisma.alerta.count({
        where: { status: 'RESOLVIDO' }
      }),

      // Alertas por nível de risco
      prisma.alerta.groupBy({
        by: ['nivelRisco'],
        _count: {
          id: true
        }
      }),

      // Alertas dos últimos 7 dias
      prisma.alerta.count({
        where: {
          dataHora: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      total: totalAlertas,
      pendentes: alertasPendentes,
      emAnalise: alertasEmAnalise,
      resolvidos: alertasResolvidos,
      porNivel: alertasPorNivel.reduce((acc, item) => {
        acc[item.nivelRisco] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      ultimos7Dias: alertasUltimos7Dias
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas de alertas:', error);
    return {
      total: 0,
      pendentes: 0,
      emAnalise: 0,
      resolvidos: 0,
      porNivel: {},
      ultimos7Dias: 0
    };
  }
}

// Função para enviar notificação para equipe de apoio
async function enviarNotificacaoEquipe(alertaId: string) {
  try {
    // Buscar dados completos do alerta
    const alerta = await prisma.alerta.findUnique({
      where: { id: alertaId },
      include: {
        usuario: {
          select: {
            id: true,
            nomeAnonimo: true,
            idade: true,
            email: true
          }
        },
        conversa: {
          select: {
            textoUsuario: true,
            textoIa: true,
            dataHora: true,
            faixaEtaria: true
          }
        }
      }
    });

    if (!alerta) {
      throw new Error('Alerta não encontrado');
    }

    // Buscar equipe de apoio disponível
    const equipeDisponivel = await prisma.equipeDeApoio.findMany({
      where: { disponivel: true }
    });

    if (equipeDisponivel.length === 0) {
      console.warn('⚠️ Nenhum membro da equipe de apoio disponível');
      return;
    }

    const notificacao: NotificacaoAlerta = {
      alertaId: alerta.id,
      nivelRisco: alerta.nivelRisco,
      usuario: {
        id: alerta.usuario.id,
        nomeAnonimo: alerta.usuario.nomeAnonimo,
        idade: alerta.usuario.idade,
        faixaEtaria: alerta.conversa.faixaEtaria
      },
      conversa: {
        textoUsuario: alerta.conversa.textoUsuario,
        textoIa: alerta.conversa.textoIa,
        dataHora: alerta.conversa.dataHora
      },
      detalhes: alerta.detalhes
    };

    // Enviar notificação para cada membro da equipe
    for (const membro of equipeDisponivel) {
      await enviarNotificacaoIndividual(membro, notificacao);
    }

    console.log(`📧 Notificações enviadas para ${equipeDisponivel.length} membros da equipe`);

  } catch (error) {
    console.error('Erro ao enviar notificação para equipe:', error);
  }
}

// Função para enviar notificação individual
async function enviarNotificacaoIndividual(
  membro: any, 
  notificacao: NotificacaoAlerta
) {
  try {
    // TODO: Implementar integração com serviço de notificação real
    // Exemplos: Email, SMS, Slack, Discord, etc.

    const urgencia = getUrgenciaTexto(notificacao.nivelRisco);
    const assunto = `🚨 ALERTA ${urgencia}: Usuário precisa de apoio`;
    
    const mensagem = `
ALERTA DE RISCO: ${notificacao.nivelRisco}

Usuário: ${notificacao.usuario.nomeAnonimo || 'Anônimo'}
Idade: ${notificacao.usuario.idade} anos
Faixa Etária: ${notificacao.usuario.faixaEtaria}

Mensagem do usuário:
"${notificacao.conversa.textoUsuario}"

Detalhes do alerta:
${notificacao.detalhes}

Data/Hora: ${notificacao.conversa.dataHora.toLocaleString('pt-BR')}

ID do Alerta: ${notificacao.alertaId}

${getAcaoRecomendada(notificacao.nivelRisco)}
    `;

    // Simulação de envio (substituir por serviço real)
    console.log(`📧 Notificação para ${membro.email}:`);
    console.log(`Assunto: ${assunto}`);
    console.log(`Mensagem: ${mensagem}`);

    // Em produção, implementar:
    // await servicoEmail.enviar({
    //   para: membro.email,
    //   assunto,
    //   corpo: mensagem,
    //   prioridade: notificacao.nivelRisco === 'CRITICO' ? 'alta' : 'normal'
    // });

    // await servicoSMS.enviar({
    //   telefone: membro.telefone,
    //   mensagem: `ALERTA ${urgencia}: Usuário ${notificacao.usuario.id} precisa de apoio. Verifique o painel.`
    // });

  } catch (error) {
    console.error(`Erro ao enviar notificação para ${membro.email}:`, error);
  }
}

// Função auxiliar para obter texto de urgência
function getUrgenciaTexto(nivel: NivelRisco): string {
  switch (nivel) {
    case 'CRITICO': return 'CRÍTICO';
    case 'ALTO': return 'ALTO';
    case 'MEDIO': return 'MÉDIO';
    case 'BAIXO': return 'BAIXO';
    default: return 'DESCONHECIDO';
  }
}

// Função auxiliar para obter ação recomendada
function getAcaoRecomendada(nivel: NivelRisco): string {
  switch (nivel) {
    case 'CRITICO':
      return `
⚠️ AÇÃO IMEDIATA NECESSÁRIA:
- Contatar o usuário imediatamente
- Considerar acionamento de serviços de emergência
- Monitoramento contínuo
- CVV: 188 (disponível para orientação)
      `;
    case 'ALTO':
      return `
🔴 AÇÃO URGENTE:
- Contatar o usuário em até 1 hora
- Oferecer suporte especializado
- Acompanhamento próximo
      `;
    case 'MEDIO':
      return `
🟡 AÇÃO NECESSÁRIA:
- Contatar o usuário em até 4 horas
- Oferecer recursos de apoio
- Agendar acompanhamento
      `;
    case 'BAIXO':
      return `
🟢 MONITORAMENTO:
- Acompanhar evolução
- Disponibilizar recursos
- Contato em até 24 horas se necessário
      `;
    default:
      return 'Avaliar situação e tomar ação apropriada.';
  }
}

// Função para criar membro da equipe de apoio
export async function criarMembroEquipe(dados: {
  email: string;
  nome: string;
  funcao: string;
}) {
  try {
    const membro = await prisma.equipeDeApoio.create({
      data: {
        email: dados.email,
        nome: dados.nome,
        funcao: dados.funcao,
        disponivel: true
      }
    });

    console.log(`👥 Novo membro da equipe criado: ${dados.nome} (${dados.funcao})`);
    return membro;
  } catch (error) {
    console.error('Erro ao criar membro da equipe:', error);
    throw error;
  }
}

// Função para atualizar disponibilidade da equipe
export async function atualizarDisponibilidadeEquipe(
  membroId: string, 
  disponivel: boolean
) {
  try {
    await prisma.equipeDeApoio.update({
      where: { id: membroId },
      data: { disponivel }
    });

    console.log(`👥 Disponibilidade atualizada para membro ${membroId}: ${disponivel}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error);
    return false;
  }
}
