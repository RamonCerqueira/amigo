import { NextRequest, NextResponse } from "next/server";
import { atualizarPerfilSchema } from "@/lib/validations";
import { buscarUsuarioPorId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ======================
// GET - Buscar usuário
// ======================
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nomeAnonimo: true,
        telefone: true,
        idade: true,
        endereco: true,
        dataRegistro: true,
        ultimoAcesso: true,
        emailVerificado: true,
        contaAtiva: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, usuario }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ======================
// PUT - Atualizar usuário
// ======================
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Verificar se usuário existe
    const usuarioExistente = await buscarUsuarioPorId(id);
    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Validar dados com Zod
    const dadosValidados = atualizarPerfilSchema.parse(body);

    // Verificar se telefone já está em uso por outro usuário
    if (dadosValidados.telefone) {
      const telefoneExistente = await prisma.usuario.findFirst({
        where: {
          telefone: dadosValidados.telefone,
          id: { not: id },
        },
      });

      if (telefoneExistente) {
        return NextResponse.json(
          { error: "Telefone já está em uso por outro usuário" },
          { status: 409 }
        );
      }
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: {
        ...dadosValidados,
        ultimoAcesso: new Date(),
      },
      select: {
        id: true,
        email: true,
        nomeAnonimo: true,
        telefone: true,
        idade: true,
        endereco: true,
        dataRegistro: true,
        ultimoAcesso: true,
        emailVerificado: true,
        contaAtiva: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Perfil atualizado com sucesso",
        usuario: usuarioAtualizado,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);

    if (error.errors) {
      // Erros de validação do Zod
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ======================
// DELETE - Desativar usuário
// ======================
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Verificar se usuário existe
    const usuarioExistente = await buscarUsuarioPorId(id);
    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Desativar conta (não deletar)
    await prisma.usuario.update({
      where: { id },
      data: {
        contaAtiva: false,
        ultimoAcesso: new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Conta desativada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
