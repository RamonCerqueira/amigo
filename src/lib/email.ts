import crypto from 'crypto';

// Interface para configuração de email
interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Função para gerar código de verificação de 6 dígitos
export function gerarCodigoVerificacao(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Função para calcular data de expiração (15 minutos)
export function calcularDataExpiracao(): Date {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() + 15);
  return agora;
}

// Template HTML para email de verificação
export function criarTemplateVerificacao(codigo: string, nomeUsuario?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Conta - Amigo</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4A90E2;
                margin-bottom: 10px;
            }
            .codigo {
                background-color: #f8f9fa;
                border: 2px dashed #4A90E2;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border-radius: 8px;
            }
            .codigo-numero {
                font-size: 32px;
                font-weight: bold;
                color: #4A90E2;
                letter-spacing: 5px;
                font-family: 'Courier New', monospace;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🤝 Amigo</div>
                <h2>Verificação de Conta</h2>
            </div>
            
            <p>Olá${nomeUsuario ? `, ${nomeUsuario}` : ''}!</p>
            
            <p>Obrigado por se cadastrar no <strong>Amigo</strong>, sua plataforma de apoio emocional e desenvolvimento pessoal.</p>
            
            <p>Para ativar sua conta, utilize o código de verificação abaixo:</p>
            
            <div class="codigo">
                <p style="margin: 0; font-size: 16px; color: #666;">Seu código de verificação:</p>
                <div class="codigo-numero">${codigo}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este código expira em <strong>15 minutos</strong></li>
                    <li>Use apenas no aplicativo oficial Amigo</li>
                    <li>Nunca compartilhe este código com terceiros</li>
                </ul>
            </div>
            
            <p>Se você não solicitou este cadastro, pode ignorar este email com segurança.</p>
            
            <p>Estamos aqui para apoiá-lo em sua jornada de bem-estar e crescimento pessoal.</p>
            
            <div class="footer">
                <p><strong>Equipe Amigo</strong></p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
                <p>Se precisar de ajuda, entre em contato conosco através do aplicativo.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Função para enviar email (implementação mock - substituir por serviço real)
export async function enviarEmailVerificacao(
  email: string, 
  codigo: string, 
  nomeUsuario?: string
): Promise<boolean> {
  try {
    // TODO: Implementar integração com serviço de email real
    // Exemplos: SendGrid, AWS SES, Nodemailer, etc.
    
    const emailConfig: EmailConfig = {
      from: 'noreply@amigo.app',
      to: email,
      subject: 'Verificação de Conta - Amigo',
      html: criarTemplateVerificacao(codigo, nomeUsuario)
    };
    
    // Simulação de envio (remover em produção)
    console.log('📧 Email de verificação enviado para:', email);
    console.log('🔑 Código:', codigo);
    console.log('📄 Template:', emailConfig.html);
    
    // Em produção, substituir por:
    // const resultado = await servicoEmail.enviar(emailConfig);
    // return resultado.sucesso;
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    return false;
  }
}

// Função para reenviar código de verificação
export async function reenviarCodigoVerificacao(
  email: string, 
  nomeUsuario?: string
): Promise<{ sucesso: boolean; codigo?: string }> {
  try {
    const novoCodigo = gerarCodigoVerificacao();
    const emailEnviado = await enviarEmailVerificacao(email, novoCodigo, nomeUsuario);
    
    if (emailEnviado) {
      return { sucesso: true, codigo: novoCodigo };
    } else {
      return { sucesso: false };
    }
  } catch (error) {
    console.error('Erro ao reenviar código de verificação:', error);
    return { sucesso: false };
  }
}

// Função para verificar se código ainda é válido
export function codigoAindaValido(dataExpiracao: Date): boolean {
  return new Date() < dataExpiracao;
}

// Função para limpar códigos expirados (para executar periodicamente)
export function limparCodigosExpirados() {
  // TODO: Implementar limpeza automática de códigos expirados no banco
  console.log('🧹 Limpando códigos de verificação expirados...');
}
