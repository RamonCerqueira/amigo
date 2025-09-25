import { NextRequest, NextResponse } from 'next/server';
import { criarMembroEquipe, atualizarDisponibilidadeEquipe } from '@/lib/alertas';
import { prisma } from '@/lib/prisma';

// GET - Buscar membros da equipe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apenasDisponiveis = searchParams.get('disponiveis') === 'true';

    const filtro = apenasDisponiveis ? { disponivel: true } : {};

    const membros = await prisma.equipeDeApoio.findMany({
      where: filtro,
      select: {
        id: true,
        email: true,
        nome: true,
        funcao: true,
        disponivel: true
      },
      orderBy: [
        { disponivel: 'desc' },
        { nome: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      membros,
      total: membros.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao buscar equipe:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// POST - Criar novo membro da equipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nome, funcao } = body;

    if (!email || !nome || !funcao) {
      return NextResponse.json({
        error: 'Email, nome e função são obrigatórios'
      }, { status: 400 });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Email inválido'
      }, { status: 400 });
    }

    // Verificar se email já existe
    const membroExistente = await prisma.equipeDeApoio.findUnique({
      where: { email }
    });

    if (membroExistente) {
      return NextResponse.json({
        error: 'Email já está em uso'
      }, { status: 409 });
    }

    const novoMembro = await criarMembroEquipe({
      email,
      nome,
      funcao
    });

    return NextResponse.json({
      success: true,
      message: 'Membro da equipe criado com sucesso',
      membro: {
        id: novoMembro.id,
        email: novoMembro.email,
        nome: novoMembro.nome,
        funcao: novoMembro.funcao,
        disponivel: novoMembro.disponivel
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar membro da equipe:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// PUT - Atualizar disponibilidade de membro
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { membroId, disponivel } = body;

    if (!membroId || typeof disponivel !== 'boolean') {
      return NextResponse.json({
        error: 'ID do membro e status de disponibilidade são obrigatórios'
      }, { status: 400 });
    }

    const sucesso = await atualizarDisponibilidadeEquipe(membroId, disponivel);

    if (!sucesso) {
      return NextResponse.json({
        error: 'Erro ao atualizar disponibilidade'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Disponibilidade atualizada com sucesso'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao atualizar disponibilidade:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
