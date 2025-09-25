import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { determinarFaixaEtaria } from './validations';

// Interface para dados de usuário
export interface UsuarioAuth {
  id: string;
  email: string;
  nomeAnonimo?: string;
  idade: number;
  emailVerificado: boolean;
  contaAtiva: boolean;
}

// Função para hash da senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Função para criar usuário
export async function criarUsuario(dados: {
  email: string;
  password: string;
  nomeAnonimo?: string;
  telefone: string;
  idade: number;
  endereco: string;
}) {
  try {
    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: dados.email }
    });

    if (usuarioExistente) {
      throw new Error('Email já está em uso');
    }

    // Verificar se telefone já existe
    const telefoneExistente = await prisma.usuario.findUnique({
      where: { telefone: dados.telefone }
    });

    if (telefoneExistente) {
      throw new Error('Telefone já está em uso');
    }

    // Hash da senha
    const passwordHash = await hashPassword(dados.password);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        email: dados.email,
        passwordHash,
        nomeAnonimo: dados.nomeAnonimo,
        telefone: dados.telefone,
        idade: dados.idade,
        endereco: dados.endereco,
        emailVerificado: false,
        contaAtiva: false
      },
      select: {
        id: true,
        email: true,
        nomeAnonimo: true,
        idade: true,
        emailVerificado: true,
        contaAtiva: true,
        dataRegistro: true
      }
    });

    return usuario;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Função para autenticar usuário
export async function autenticarUsuario(email: string, password: string): Promise<UsuarioAuth | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nomeAnonimo: true,
        idade: true,
        emailVerificado: true,
        contaAtiva: true
      }
    });

    if (!usuario) {
      return null;
    }

    const senhaValida = await verifyPassword(password, usuario.passwordHash);
    
    if (!senhaValida) {
      return null;
    }

    // Atualizar último acesso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcesso: new Date() }
    });

    return {
      id: usuario.id,
      email: usuario.email,
      nomeAnonimo: usuario.nomeAnonimo,
      idade: usuario.idade,
      emailVerificado: usuario.emailVerificado,
      contaAtiva: usuario.contaAtiva
    };
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    return null;
  }
}

// Função para buscar usuário por ID
export async function buscarUsuarioPorId(id: string): Promise<UsuarioAuth | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nomeAnonimo: true,
        idade: true,
        emailVerificado: true,
        contaAtiva: true
      }
    });

    return usuario;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Função para verificar email
export async function verificarEmail(email: string, codigo: string): Promise<boolean> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        codigoVerificacao: true,
        codigoExpiresEm: true,
        emailVerificado: true
      }
    });

    if (!usuario) {
      return false;
    }

    if (usuario.emailVerificado) {
      return true; // Já verificado
    }

    if (!usuario.codigoVerificacao || !usuario.codigoExpiresEm) {
      return false;
    }

    // Verificar se código não expirou
    if (new Date() > usuario.codigoExpiresEm) {
      return false;
    }

    // Verificar código
    if (usuario.codigoVerificacao !== codigo) {
      return false;
    }

    // Ativar conta
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        contaAtiva: true,
        codigoVerificacao: null,
        codigoExpiresEm: null
      }
    });

    // Registrar log de verificação bem-sucedida
    await prisma.logVerificacaoEmail.create({
      data: {
        usuarioId: usuario.id,
        codigo,
        tentativas: 1,
        sucesso: true,
        dataExpiracao: usuario.codigoExpiresEm
      }
    });

    return true;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
}

// Função para gerar e salvar código de verificação
export async function gerarCodigoVerificacao(email: string): Promise<string | null> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!usuario) {
      return null;
    }

    // Gerar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Data de expiração (15 minutos)
    const dataExpiracao = new Date();
    dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 15);

    // Salvar código no usuário
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoVerificacao: codigo,
        codigoExpiresEm: dataExpiracao
      }
    });

    // Registrar log de envio
    await prisma.logVerificacaoEmail.create({
      data: {
        usuarioId: usuario.id,
        codigo,
        tentativas: 0,
        sucesso: false,
        dataExpiracao
      }
    });

    return codigo;
  } catch (error) {
    console.error('Erro ao gerar código de verificação:', error);
    return null;
  }
}

// Função para salvar conversa
export async function salvarConversa(dados: {
  usuarioId: string;
  textoUsuario: string;
  textoIa: string;
  riscoDetectado?: boolean;
}) {
  try {
    // Buscar idade do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: dados.usuarioId },
      select: { idade: true }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const faixaEtaria = determinarFaixaEtaria(usuario.idade);

    const conversa = await prisma.conversa.create({
      data: {
        usuarioId: dados.usuarioId,
        textoUsuario: dados.textoUsuario,
        textoIa: dados.textoIa,
        riscoDetectado: dados.riscoDetectado || false,
        idadeUsuario: usuario.idade,
        faixaEtaria
      }
    });

    return conversa;
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
    throw error;
  }
}

// Função para buscar histórico de conversas
export async function buscarHistoricoConversas(usuarioId: string, limite: number = 50) {
  try {
    const conversas = await prisma.conversa.findMany({
      where: { usuarioId },
      orderBy: { dataHora: 'desc' },
      take: limite,
      select: {
        id: true,
        dataHora: true,
        textoUsuario: true,
        textoIa: true,
        riscoDetectado: true
      }
    });

    return conversas;
  } catch (error) {
    console.error('Erro ao buscar histórico de conversas:', error);
    return [];
  }
}
