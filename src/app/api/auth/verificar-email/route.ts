import { NextRequest, NextResponse } from 'next/server';
import { verificacaoEmailSchema } from '@/lib/validations';
import { verificarEmail, gerarCodigoVerificacao } from '@/lib/auth';
import { enviarEmailVerificacao } from '@/lib/email';
import { ZodError } from 'zod';

// 👇 Endpoint para verificar email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const dadosValidados = verificacaoEmailSchema.parse(body);

    // Verificar código
    const verificacaoSucesso = await verificarEmail(
      dadosValidados.email,
      dadosValidados.codigo
    );

    if (!verificacaoSucesso) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email verificado com sucesso. Sua conta foi ativada!' },
      { status: 200 }
    );

  } catch (error: unknown) {
    // ✅ Tratar ZodError corretamente usando `issues`
    if (error instanceof ZodError) {
      const detalhes = error.issues.map(issue => ({
        field: issue.path[0]?.toString() ?? 'unknown',
        message: issue.message
      }));
      return NextResponse.json(
        { error: 'Dados inválidos', details: detalhes },
        { status: 400 }
      );
    }

    // Outros tipos de erro
    let mensagemErro: string;
    if (error instanceof Error) {
      mensagemErro = error.message;
    } else if (typeof error === 'string') {
      mensagemErro = error;
    } else {
      mensagemErro = 'Erro interno do servidor';
    }

    console.error('Erro na verificação de email:', mensagemErro);

    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}

// 👇 Endpoint para reenviar código de verificação
export async function PUT(request: NextRequest) {
  try {
    const body: { email?: string } = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Gerar novo código
    const codigo = await gerarCodigoVerificacao(email);

    if (!codigo) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou erro ao gerar código' },
        { status: 404 }
      );
    }

    // Enviar email
    const emailEnviado = await enviarEmailVerificacao(email, codigo);

    if (!emailEnviado) {
      return NextResponse.json(
        { error: 'Erro ao enviar email de verificação' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Novo código de verificação enviado' },
      { status: 200 }
    );

  } catch (error: unknown) {
    let mensagemErro: string;

    if (error instanceof Error) {
      mensagemErro = error.message;
    } else if (typeof error === 'string') {
      mensagemErro = error;
    } else {
      mensagemErro = 'Erro interno do servidor';
    }

    console.error('Erro ao reenviar código:', mensagemErro);

    return NextResponse.json({ error: mensagemErro }, { status: 500 });
  }
}
