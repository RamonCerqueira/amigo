'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Shield, Users, Mic, MessageCircle, ArrowRight } from 'lucide-react';
import InstallPWA from '@/components/InstallPWA';

export default function Home() {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Apoio Emocional",
      description: "Conversas acolhedoras e empáticas disponíveis 24/7 para quando você mais precisar."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Ambiente Seguro",
      description: "Suas conversas são privadas e protegidas. Fale livremente sem julgamentos."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Equipe Especializada",
      description: "Profissionais qualificados monitoram e oferecem suporte quando necessário."
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Conversa por Voz",
      description: "Fale naturalmente como se estivesse conversando com um amigo de verdade."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
              Amigo
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/sobre" className="text-gray-600 hover:text-yellow-600 transition-colors">
              Sobre
            </Link>
            <Link href="/como-funciona" className="text-gray-600 hover:text-yellow-600 transition-colors">
              Como Funciona
            </Link>
            <Link href="/contato" className="text-gray-600 hover:text-yellow-600 transition-colors">
              Contato
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/registro" 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Começar Agora
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Você não está
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
              {" "}sozinho
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            O Amigo é sua plataforma de apoio emocional e desenvolvimento pessoal. 
            Converse por voz com nossa IA empática e receba o suporte que você merece.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/registro"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Começar Conversa</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/como-funciona"
              className="border-2 border-yellow-500 text-yellow-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-50 transition-all duration-300"
            >
              Como Funciona
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-gray-700">
                      Olá! Como você está se sentindo hoje? Estou aqui para conversar e te apoiar.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-yellow-500 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-white">
                      Oi... estou me sentindo um pouco sozinho hoje.
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Mic className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Por que escolher o Amigo?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nossa plataforma foi desenvolvida com foco na sua segurança, privacidade e bem-estar emocional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform ${
                isHovered === feature.title ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <div className="text-yellow-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-yellow-600 to-yellow-700 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já encontraram apoio e crescimento pessoal com o Amigo.
          </p>
          
          <Link 
            href="/registro"
            className="bg-white text-yellow-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
          >
            <span>Criar Conta Gratuita</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Amigo</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-600">
              <Link href="/privacidade" className="hover:text-yellow-600 transition-colors">
                Privacidade
              </Link>
              <Link href="/termos" className="hover:text-yellow-600 transition-colors">
                Termos
              </Link>
              <Link href="/ajuda" className="hover:text-yellow-600 transition-colors">
                Ajuda
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Amigo. Todos os direitos reservados. Feito com ❤️ para apoiar você.</p>
          </div>
        </div>
      </footer>

      {/* Componente de instalação PWA */}
      <InstallPWA />
    </div>
  );
}
