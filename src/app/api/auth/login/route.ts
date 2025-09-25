import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations';
import { autenticarUsuario } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const dadosValidados = loginSchema.parse(body);

    // Autenticar usuário
    const usuario = await autenticarUsuario(
      dadosValidados.email,
      dadosValidados.password
    );

    if (!usuario) {
      return NextResponse.json({
        error: 'Email ou senha incorretos'
      }, { status: 401 });
    }

    // Verificar se a conta está ativa
    if (!usuario.contaAtiva) {
      return NextResponse.json({
        error: 'Conta não ativada. Verifique seu email.',
        needsVerification: true,
        email: usuario.email
      }, { status: 403 });
    }

    // TODO: Implementar JWT ou sessão
    // Por enquanto, retornar dados do usuário
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nomeAnonimo: usuario.nomeAnonimo,
        idade: usuario.idade,
        emailVerificado: usuario.emailVerificado,
        contaAtiva: usuario.contaAtiva
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no login:', error);

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
