'use client';

import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Heart, AlertTriangle, ExternalLink } from 'lucide-react';

export default function EmergenciaPage() {
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const recursosEmergencia = [
    {
      nome: 'CVV - Centro de Valorização da Vida',
      telefone: '188',
      descricao: 'Apoio emocional e prevenção do suicídio',
      disponibilidade: '24 horas, todos os dias',
      gratuito: true,
      tipo: 'telefone'
    },
    {
      nome: 'SAMU',
      telefone: '192',
      descricao: 'Serviço de Atendimento Móvel de Urgência',
      disponibilidade: '24 horas, todos os dias',
      gratuito: true,
      tipo: 'emergencia'
    },
    {
      nome: 'Polícia Militar',
      telefone: '190',
      descricao: 'Emergências e situações de risco',
      disponibilidade: '24 horas, todos os dias',
      gratuito: true,
      tipo: 'emergencia'
    },
    {
      nome: 'Bombeiros',
      telefone: '193',
      descricao: 'Emergências médicas e resgates',
      disponibilidade: '24 horas, todos os dias',
      gratuito: true,
      tipo: 'emergencia'
    }
  ];

  const recursosOnline = [
    {
      nome: 'CVV Chat',
      url: 'https://www.cvv.org.br/chat/',
      descricao: 'Conversa online com voluntários',
      disponibilidade: 'Todos os dias, 17h às 01h'
    },
    {
      nome: 'Mapa da Saúde Mental',
      url: 'https://mapadasaudemental.com.br/',
      descricao: 'Encontre profissionais de saúde mental',
      disponibilidade: 'Sempre disponível'
    },
    {
      nome: 'CAPS Localizador',
      url: 'https://portalms.saude.gov.br/acoes-e-programas/centro-de-atencao-psicossocial-caps',
      descricao: 'Centros de Atenção Psicossocial',
      disponibilidade: 'Horário comercial'
    }
  ];

  const sinaisAlerta = [
    'Pensamentos de morte ou suicídio',
    'Sentimentos intensos de desesperança',
    'Isolamento social extremo',
    'Mudanças drásticas de comportamento',
    'Abuso de álcool ou drogas',
    'Falar sobre não ter razão para viver',
    'Dar objetos pessoais importantes',
    'Despedir-se de forma incomum'
  ];

  const primeirosPassos = [
    {
      titulo: 'Respire fundo',
      descricao: 'Faça respirações lentas e profundas para se acalmar',
      icone: '🫁'
    },
    {
      titulo: 'Você não está sozinho',
      descricao: 'Existem pessoas que se importam e querem ajudar',
      icone: '🤝'
    },
    {
      titulo: 'Busque ajuda imediata',
      descricao: 'Ligue para o CVV (188) ou procure um pronto-socorro',
      icone: '📞'
    },
    {
      titulo: 'Converse com alguém',
      descricao: 'Fale com um amigo, familiar ou profissional de confiança',
      icone: '💬'
    }
  ];

  const ligarPara = (numero: string) => {
    window.location.href = `tel:${numero}`;
  };

  const abrirUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header de emergência */}
      <div className="bg-red-600 text-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Recursos de Emergência</h1>
              <p className="text-red-100">Ajuda imediata disponível 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Alerta principal */}
        <div className="bg-red-100 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg">
          <div className="flex items-start">
            <Heart className="w-6 h-6 text-red-600 mt-1 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Se você está pensando em se machucar, procure ajuda AGORA
              </h2>
              <p className="text-red-700 mb-4">
                Sua vida tem valor. Existem pessoas treinadas para te ajudar neste momento difícil.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => ligarPara('188')}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Ligar CVV: 188</span>
                </button>
                <button
                  onClick={() => ligarPara('192')}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>SAMU: 192</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recursos de emergência */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-red-600" />
                Telefones de Emergência
              </h2>
              
              <div className="space-y-4">
                {recursosEmergencia.map((recurso, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{recurso.nome}</h3>
                        <p className="text-sm text-gray-600 mb-2">{recurso.descricao}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {recurso.disponibilidade}
                          </span>
                          {recurso.gratuito && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              Gratuito
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => ligarPara(recurso.telefone)}
                        className={`ml-4 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                          recurso.tipo === 'telefone' 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {recurso.telefone}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-yellow-600" />
                Recursos Online
              </h2>
              
              <div className="space-y-3">
                {recursosOnline.map((recurso, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{recurso.nome}</h3>
                        <p className="text-sm text-gray-600 mb-1">{recurso.descricao}</p>
                        <p className="text-xs text-gray-500">{recurso.disponibilidade}</p>
                      </div>
                      <button
                        onClick={() => abrirUrl(recurso.url)}
                        className="ml-4 flex items-center space-x-1 text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        <span>Acessar</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Informações e orientações */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Primeiros Passos
              </h2>
              
              <div className="space-y-4">
                {primeirosPassos.map((passo, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-2xl">{passo.icone}</div>
                    <div>
                      <h3 className="font-medium text-gray-800">{passo.titulo}</h3>
                      <p className="text-sm text-gray-600">{passo.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Sinais de Alerta
              </h2>
              
              <p className="text-yellow-700 mb-4">
                Se você ou alguém que conhece apresenta estes sinais, busque ajuda imediatamente:
              </p>
              
              <ul className="space-y-2">
                {sinaisAlerta.map((sinal, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-yellow-800">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{sinal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                Lembre-se
              </h2>
              
              <div className="space-y-3 text-yellow-700">
                <p className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 mt-1 text-yellow-600" />
                  <span>Você não está sozinho nesta luta</span>
                </p>
                <p className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 mt-1 text-yellow-600" />
                  <span>Pedir ajuda é um sinal de força, não fraqueza</span>
                </p>
                <p className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 mt-1 text-yellow-600" />
                  <span>Existe tratamento e você pode se sentir melhor</span>
                </p>
                <p className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 mt-1 text-yellow-600" />
                  <span>Sua vida tem valor e significado</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de volta */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span>Voltar para Conversa com Amigo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
