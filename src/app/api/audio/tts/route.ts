import { NextRequest, NextResponse } from "next/server";
import { gerarAudio } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texto } = body;

    // Validações básicas
    if (!texto) {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
    }

    if (texto.length > 4000) {
      return NextResponse.json(
        { error: "Texto muito longo. Máximo 4000 caracteres." },
        { status: 400 }
      );
    }

    // Gerar áudio com OpenAI (retorna Buffer no Node)
    const audioBuffer: Buffer = await gerarAudio(texto);

    if (!audioBuffer) {
      return NextResponse.json(
        { error: "Erro ao gerar áudio" },
        { status: 500 }
      );
    }

    // Converter Buffer -> Uint8Array (compatível com NextResponse)
    const audioArray = new Uint8Array(audioBuffer);

    return new NextResponse(audioArray, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // cache de 1 hora
      },
    });

  } catch (error: any) {
    console.error("Erro ao gerar TTS:", error);

    // Limites de requisição da OpenAI
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Muitas requisições de áudio. Tente novamente em alguns segundos." },
        { status: 429 }
      );
    }

    // Erro de autenticação / chave inválida
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Erro de configuração do serviço de áudio." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
