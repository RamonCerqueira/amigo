import { z } from 'zod';

// Validação para registro de usuário
export const registroUsuarioSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  confirmPassword: z.string(),
  
  nomeAnonimo: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .optional(),
  
  telefone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  idade: z
    .number()
    .int('Idade deve ser um número inteiro')
    .min(13, 'Idade mínima é 13 anos')
    .max(120, 'Idade máxima é 120 anos'),
  
  endereco: z
    .string()
    .min(10, 'Endereço deve ter pelo menos 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// Validação para login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

// Validação para verificação de email
export const verificacaoEmailSchema = z.object({
  codigo: z
    .string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
  
  email: z
    .string()
    .email('Email inválido'),
});

// Validação para conversa
export const conversaSchema = z.object({
  textoUsuario: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
});

// Validação para atualização de perfil
export const atualizarPerfilSchema = z.object({
  nomeAnonimo: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .optional(),
  
  telefone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional(),
  
  endereco: z
    .string()
    .min(10, 'Endereço deve ter pelo menos 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .optional(),
});

// Função para determinar faixa etária
export function determinarFaixaEtaria(idade: number): 'CRIANCA' | 'ADOLESCENTE' | 'JOVEM_ADULTO' | 'ADULTO' | 'IDOSO' {
  if (idade <= 12) return 'CRIANCA';
  if (idade <= 17) return 'ADOLESCENTE';
  if (idade <= 25) return 'JOVEM_ADULTO';
  if (idade <= 59) return 'ADULTO';
  return 'IDOSO';
}

// Função para validar telefone brasileiro
export function validarTelefoneBrasileiro(telefone: string): boolean {
  const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return telefoneRegex.test(telefone);
}

// Função para formatar telefone
export function formatarTelefone(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  if (apenasNumeros.length === 11) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  } else if (apenasNumeros.length === 10) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
  }
  
  return telefone;
}

// Tipos TypeScript derivados dos schemas
export type RegistroUsuario = z.infer<typeof registroUsuarioSchema>;
export type Login = z.infer<typeof loginSchema>;
export type VerificacaoEmail = z.infer<typeof verificacaoEmailSchema>;
export type Conversa = z.infer<typeof conversaSchema>;
export type AtualizarPerfil = z.infer<typeof atualizarPerfilSchema>;
