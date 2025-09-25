import { NextRequest, NextResponse } from 'next/server';
import { registroUsuarioSchema } from '@/lib/validations';
import { criarUsuario, gerarCodigoVerificacao } from '@/lib/auth';
import { enviarEmailVerificacao } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const dadosValidados = registroUsuarioSchema.parse(body);

    // Criar usuário no banco de dados
    const usuario = await criarUsuario({
      email: dadosValidados.email,
      password: dadosValidados.password,
      nomeAnonimo: dadosValidados.nomeAnonimo,
      telefone: dadosValidados.telefone,
      idade: dadosValidados.idade,
      endereco: dadosValidados.endereco
    });

    // Gerar código de verificação
    const codigo = await gerarCodigoVerificacao(dadosValidados.email);
    
    if (!codigo) {
      return NextResponse.json(
        { error: 'Erro ao gerar código de verificação' },
        { status: 500 }
      );
    }

    // Enviar email de verificação
    const emailEnviado = await enviarEmailVerificacao(
      dadosValidados.email,
      codigo,
      dadosValidados.nomeAnonimo
    );

    if (!emailEnviado) {
      console.error('Falha ao enviar email de verificação para:', dadosValidados.email);
      // Não falhar o registro por causa do email
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso. Verifique seu email.',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nomeAnonimo: usuario.nomeAnonimo,
        emailVerificado: usuario.emailVerificado,
        contaAtiva: usuario.contaAtiva
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro no registro:', error);

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

    // Erro de usuário já existente
    if (error.message === 'Email já está em uso') {
      return NextResponse.json({
        error: 'Email já está em uso'
      }, { status: 409 });
    }

    if (error.message === 'Telefone já está em uso') {
      return NextResponse.json({
        error: 'Telefone já está em uso'
      }, { status: 409 });
    }

    // Erro genérico
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
