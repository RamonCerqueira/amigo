'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, TrendingUp, Shield, Settings, LogOut, User } from 'lucide-react';
import ConversaVoz from '@/components/ConversaVoz';

// Mock do usuário logado (em produção viria do contexto de autenticação)
const usuarioMock = {
  id: 'user123',
  email: 'usuario@exemplo.com',
  nomeAnonimo: 'Amigo Usuário',
  idade: 25
};

interface DashboardData {
  usuario: any;
  estatisticas: {
    totalConversas: number;
    conversasHoje: number;
    conversasSemana: number;
    alertasAtivos: number;
  };
  ultimasConversas: any[];
  graficos: any;
  recomendacoes: any[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversa' | 'estatisticas' | 'historico'>('conversa');
  const [showRiscoAlert, setShowRiscoAlert] = useState(false);
  const [riscoInfo, setRiscoInfo] = useState<any>(null);

  // Carregar dados do dashboard
  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboard?usuarioId=${usuarioMock.id}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaConversa = (conversa: any) => {
    // Atualizar estatísticas localmente
    if (dashboardData) {
      setDashboardData(prev => prev ? {
        ...prev,
        estatisticas: {
          ...prev.estatisticas,
          totalConversas: prev.estatisticas.totalConversas + 1,
          conversasHoje: prev.estatisticas.conversasHoje + 1
        }
      } : null);
    }
  };

  const handleRiscoDetectado = (risco: any) => {
    setRiscoInfo(risco);
    setShowRiscoAlert(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu espaço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Amigo</h1>
                <p className="text-sm text-gray-600">
                  Olá, {dashboardData?.usuario.nomeAnonimo || 'Amigo'}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerta de Risco */}
      {showRiscoAlert && riscoInfo && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded-r-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Detectamos que você pode estar passando por um momento difícil
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Nossa equipe de apoio foi notificada. Lembre-se: você não está sozinho.
              </p>
              <div className="mt-2 flex space-x-2">
                <button className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                  CVV: 188 (24h gratuito)
                </button>
                <button 
                  onClick={() => setShowRiscoAlert(false)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar com estatísticas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estatísticas rápidas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Suas estatísticas</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Conversas hoje</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {dashboardData?.estatisticas.conversasHoje || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Esta semana</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {dashboardData?.estatisticas.conversasSemana || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                  <span className="font-semibold text-purple-600">
                    {dashboardData?.estatisticas.totalConversas || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recomendações */}
            {dashboardData?.recomendacoes && dashboardData.recomendacoes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recomendações</h3>
                
                <div className="space-y-3">
                  {dashboardData.recomendacoes.map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        {rec.titulo}
                      </h4>
                      <p className="text-xs text-blue-700 mb-2">
                        {rec.descricao}
                      </p>
                      <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                        {rec.acao}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('conversa')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'conversa' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Conversa
                </button>
                
                <button
                  onClick={() => setActiveTab('estatisticas')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'estatisticas' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Estatísticas
                </button>
                
                <button
                  onClick={() => setActiveTab('historico')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'historico' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Histórico
                </button>
              </nav>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {activeTab === 'conversa' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px]">
                <ConversaVoz
                  usuarioId={usuarioMock.id}
                  onNovaConversa={handleNovaConversa}
                  onRiscoDetectado={handleRiscoDetectado}
                />
              </div>
            )}

            {activeTab === 'estatisticas' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Estatísticas Detalhadas</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Progresso Semanal</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardData?.estatisticas.conversasSemana || 0}
                    </p>
                    <p className="text-sm text-blue-700">conversas esta semana</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-800 mb-2">Jornada Total</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData?.estatisticas.totalConversas || 0}
                    </p>
                    <p className="text-sm text-purple-700">conversas no total</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Análise de Bem-estar</h3>
                  <p className="text-gray-600 mb-4">
                    Com base em suas conversas, você tem mostrado progresso em sua jornada de bem-estar.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.graficos?.analiseHumor?.positivo || 45}%
                      </div>
                      <div className="text-sm text-gray-600">Positivo</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {dashboardData?.graficos?.analiseHumor?.neutro || 35}%
                      </div>
                      <div className="text-sm text-gray-600">Neutro</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {dashboardData?.graficos?.analiseHumor?.negativo || 20}%
                      </div>
                      <div className="text-sm text-gray-600">Negativo</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Histórico de Conversas</h2>
                
                {dashboardData?.ultimasConversas && dashboardData.ultimasConversas.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.ultimasConversas.map((conversa, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(conversa.dataHora).toLocaleString('pt-BR')}
                          </span>
                          {conversa.riscoDetectado && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Risco detectado
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Você:</strong> {conversa.textoUsuario}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-800">
                              <strong>Amigo:</strong> {conversa.textoIa}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa ainda.</p>
                    <p className="text-sm">Comece uma conversa na aba "Conversa"!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
