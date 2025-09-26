'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerificacaoEmail() {
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Email do usuário (em produção, viria do estado global ou URL params)
  const userEmail = "usuario@exemplo.com";

  // Timer para expiração do código
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Timer para cooldown de reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Permitir apenas números
    if (!/^\d*$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Limpar erro quando usuário começar a digitar
    if (error) setError('');

    // Mover para o próximo input automaticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar automaticamente quando todos os campos estiverem preenchidos
    if (newCodigo.every(digit => digit !== '') && !newCodigo.includes('')) {
      handleVerification(newCodigo.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: mover para o input anterior se o atual estiver vazio
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Arrow keys para navegação
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCodigo = pastedData.split('');
      setCodigo(newCodigo);
      handleVerification(pastedData);
    }
  };

  const handleVerification = async (codigoCompleto: string) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implementar chamada para API de verificação
      console.log('Verificando código:', codigoCompleto);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular verificação (remover em produção)
      if (codigoCompleto === '123456') {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError('Código inválido. Verifique e tente novamente.');
        setCodigo(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
      setCodigo(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      // TODO: Implementar chamada para API de reenvio
      console.log('Reenviando código para:', userEmail);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset timer e cooldown
      setTimeLeft(900);
      setCanResend(false);
      setResendCooldown(60); // 1 minuto de cooldown
      
      // Limpar campos
      setCodigo(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 6) {
      setError('Por favor, digite o código completo de 6 dígitos.');
      return;
    }
    
    handleVerification(codigoCompleto);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/registro" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao registro</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amigo
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verificar seu email
          </h1>
          <p className="text-gray-600">
            Enviamos um código de 6 dígitos para
          </p>
          <p className="text-blue-600 font-medium">
            {userEmail}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Email verificado com sucesso!
              </h2>
              <p className="text-gray-600 mb-4">
                Sua conta foi ativada. Redirecionando...
              </p>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Email Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Digite o código de verificação abaixo
                </p>
              </div>

              {/* Code Input Form */}
              <form onSubmit={handleSubmit}>
                <div className="flex justify-center space-x-3 mb-6">
                  {codigo.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {inputRefs.current[index] = el}}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } ${digit ? 'border-blue-500 bg-blue-50' : ''}`}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                {/* Timer */}
                <div className="text-center mb-6">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600">
                      Código expira em{' '}
                      <span className="font-medium text-blue-600">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      Código expirado. Solicite um novo código.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || codigo.some(digit => !digit)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Verificar código</span>
                  )}
                </button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Não recebeu o código?
                </p>
                
                <button
                  onClick={handleResendCode}
                  disabled={isResending || (!canResend && timeLeft > 0) || resendCooldown > 0}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-1 mx-auto"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Reenviando...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Reenviar em {resendCooldown}s</span>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Reenviar código</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Verifique sua caixa de spam se não encontrar o email.
          </p>
          <p className="mt-1">
            Precisa de ajuda?{' '}
            <Link href="/contato" className="text-blue-600 hover:underline">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
