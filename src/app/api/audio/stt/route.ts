import { NextRequest, NextResponse } from 'next/server';
import { transcreverAudio } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({
        error: 'Arquivo de áudio é obrigatório'
      }, { status: 400 });
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({
        error: 'Tipo de arquivo não suportado. Use WebM, MP4, MP3, WAV ou OGG.'
      }, { status: 400 });
    }

    // Verificar tamanho do arquivo (máximo 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({
        error: 'Arquivo muito grande. Máximo 25MB.'
      }, { status: 400 });
    }

    // Converter arquivo para buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Transcrever áudio com OpenAI Whisper
    const textoTranscrito = await transcreverAudio(audioBuffer);

    if (!textoTranscrito) {
      return NextResponse.json({
        error: 'Não foi possível transcrever o áudio. Tente falar mais claramente.'
      }, { status: 400 });
    }

    // Verificar se a transcrição não está vazia
    if (textoTranscrito.trim().length === 0) {
      return NextResponse.json({
        error: 'Nenhuma fala foi detectada no áudio.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      texto: textoTranscrito.trim(),
      metadata: {
        tamanhoArquivo: audioFile.size,
        tipoArquivo: audioFile.type,
        duracaoEstimada: Math.round(audioFile.size / 16000) // Estimativa baseada em bitrate
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao transcrever áudio:', error);

    // Erro de API da OpenAI
    if (error.status === 429) {
      return NextResponse.json({
        error: 'Muitas requisições de transcrição. Tente novamente em alguns segundos.'
      }, { status: 429 });
    }

    if (error.status === 401) {
      return NextResponse.json({
        error: 'Erro de configuração do serviço de transcrição.'
      }, { status: 500 });
    }

    // Erro de arquivo corrompido ou inválido
    if (error.message?.includes('invalid')) {
      return NextResponse.json({
        error: 'Arquivo de áudio inválido ou corrompido.'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
