'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, AlertTriangle } from 'lucide-react';

interface Mensagem {
  id: string;
  tipo: 'usuario' | 'ia';
  texto: string;
  dataHora: Date;
  audio?: string; // URL do áudio para mensagens da IA
}

interface ConversaVozProps {
  usuarioId: string;
  onNovaConversa?: (conversa: any) => void;
  onRiscoDetectado?: (risco: any) => void;
}

export default function ConversaVoz({ usuarioId, onNovaConversa, onRiscoDetectado }: ConversaVozProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [isGravando, setIsGravando] = useState(false);
  const [isProcessando, setIsProcessando] = useState(false);
  const [isReproduzinoAudio, setIsReproduzinoAudio] = useState(false);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [textoDigitado, setTextoDigitado] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para última mensagem
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Inicializar gravação de áudio
  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processarAudio(audioBlob);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsGravando(true);
      setError(null);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setError('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Parar gravação
  const pararGravacao = () => {
    if (mediaRecorderRef.current && isGravando) {
      mediaRecorderRef.current.stop();
      setIsGravando(false);
    }
  };

  // Processar áudio gravado
  const processarAudio = async (audioBlob: Blob) => {
    setIsProcessando(true);

    try {
      // Converter áudio em texto (STT)
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const sttResponse = await fetch('/api/audio/stt', {
        method: 'POST',
        body: formData,
      });

      if (!sttResponse.ok) {
        const errorData = await sttResponse.json();
        throw new Error(errorData.error || 'Erro na transcrição');
      }

      const { texto } = await sttResponse.json();
      
      // Processar mensagem transcrita
      await enviarMensagem(texto);

    } catch (error: any) {
      console.error('Erro ao processar áudio:', error);
      setError(error.message || 'Erro ao processar áudio');
    } finally {
      setIsProcessando(false);
    }
  };

  // Enviar mensagem (texto ou voz)
  const enviarMensagem = async (texto: string) => {
    if (!texto.trim()) return;

    const novaMensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      texto: texto.trim(),
      dataHora: new Date()
    };

    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setTextoDigitado('');
    setIsProcessando(true);

    try {
      // Enviar para API com OpenAI
      const response = await fetch('/api/conversas/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId,
          textoUsuario: texto.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na conversa');
      }

      const data = await response.json();
      
      // Criar mensagem da IA
      const novaMensagemIA: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        texto: data.conversa.textoIa,
        dataHora: new Date(data.conversa.dataHora)
      };

      // Gerar áudio da resposta se habilitado
      if (audioHabilitado) {
        try {
          const audioUrl = await gerarAudioResposta(data.conversa.textoIa);
          novaMensagemIA.audio = audioUrl;
        } catch (audioError) {
          console.warn('Erro ao gerar áudio:', audioError);
          // Continuar sem áudio
        }
      }

      setMensagens(prev => [...prev, novaMensagemIA]);

      // Reproduzir áudio automaticamente se disponível
      if (novaMensagemIA.audio && audioHabilitado) {
        reproduzirAudio(novaMensagemIA.audio);
      }

      // Callbacks
      if (onNovaConversa) {
        onNovaConversa(data.conversa);
      }

      if (data.analise?.risco?.detectado && onRiscoDetectado) {
        onRiscoDetectado(data.analise.risco);
      }

      // Mostrar alerta se risco detectado
      if (data.analise?.risco?.detectado) {
        setError(`Detectamos que você pode estar passando por um momento difícil. ${
          data.analise.recomendacoes?.[0] || 'Considere buscar ajuda profissional.'
        }`);
      }

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error.message || 'Erro ao enviar mensagem');
      
      // Remover mensagem do usuário em caso de erro
      setMensagens(prev => prev.filter(m => m.id !== novaMensagemUsuario.id));
    } finally {
      setIsProcessando(false);
    }
  };

  // Gerar áudio da resposta
  const gerarAudioResposta = async (texto: string): Promise<string> => {
    const response = await fetch('/api/audio/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texto }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar áudio');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };

  // Reproduzir áudio
  const reproduzirAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsReproduzinoAudio(true);
    audio.onended = () => setIsReproduzinoAudio(false);
    audio.onerror = () => {
      setIsReproduzinoAudio(false);
      console.error('Erro ao reproduzir áudio');
    };

    audio.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
      setIsReproduzinoAudio(false);
    });
  };

  // Parar reprodução de áudio
  const pararAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsReproduzinoAudio(false);
    }
  };

  // Enviar mensagem digitada
  const handleEnviarTexto = (e: React.FormEvent) => {
    e.preventDefault();
    if (textoDigitado.trim() && !isProcessando) {
      enviarMensagem(textoDigitado);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-50">
        <h3 className="text-lg font-semibold text-gray-800">Conversa com Amigo</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioHabilitado(!audioHabilitado)}
            className={`p-2 rounded-full transition-colors ${
              audioHabilitado 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={audioHabilitado ? 'Desabilitar áudio' : 'Habilitar áudio'}
          >
            {audioHabilitado ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {isReproduzinoAudio && (
            <button
              onClick={pararAudio}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Parar áudio"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">Olá! Sou o Amigo, estou aqui para te apoiar.</p>
            <p className="text-sm">Clique no microfone para falar ou digite sua mensagem abaixo.</p>
          </div>
        )}

        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                mensagem.tipo === 'usuario'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{mensagem.texto}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {mensagem.dataHora.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {mensagem.audio && mensagem.tipo === 'ia' && (
                  <button
                    onClick={() => reproduzirAudio(mensagem.audio!)}
                    className="ml-2 p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Reproduzir áudio"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isProcessando && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          </div>
        )}

        <div ref={mensagensEndRef} />
      </div>

      {/* Erro */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {/* Botão de gravação */}
        <div className="flex items-center justify-center mb-3">
          <button
            onClick={isGravando ? pararGravacao : iniciarGravacao}
            disabled={isProcessando}
            className={`p-4 rounded-full transition-all duration-200 ${
              isGravando
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {isGravando ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mb-3">
          {isGravando ? 'Gravando... Clique para parar' : 'Clique para falar'}
        </p>

        {/* Input de texto */}
        <form onSubmit={handleEnviarTexto} className="flex space-x-2">
          <input
            type="text"
            value={textoDigitado}
            onChange={(e) => setTextoDigitado(e.target.value)}
            placeholder="Ou digite sua mensagem..."
            disabled={isProcessando || isGravando}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!textoDigitado.trim() || isProcessando || isGravando}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
