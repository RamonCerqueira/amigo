import { NextRequest, NextResponse } from 'next/server';
import { verificacaoEmailSchema } from '@/lib/validations';
import { verificarEmail, gerarCodigoVerificacao } from '@/lib/auth';
import { enviarEmailVerificacao } from '@/lib/email';

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
      return NextResponse.json({
        error: 'Código inválido ou expirado'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso. Sua conta foi ativada!'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro na verificação de email:', error);

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

// Endpoint para reenviar código de verificação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        error: 'Email é obrigatório'
      }, { status: 400 });
    }

    // Gerar novo código
    const codigo = await gerarCodigoVerificacao(email);
    
    if (!codigo) {
      return NextResponse.json({
        error: 'Usuário não encontrado ou erro ao gerar código'
      }, { status: 404 });
    }

    // Enviar email
    const emailEnviado = await enviarEmailVerificacao(email, codigo);

    if (!emailEnviado) {
      return NextResponse.json({
        error: 'Erro ao enviar email de verificação'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Novo código de verificação enviado'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao reenviar código:', error);

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
