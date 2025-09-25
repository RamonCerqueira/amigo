'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  Shield,
  Heart
} from 'lucide-react';

interface Alerta {
  id: string;
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  status: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDO';
  dataHora: string;
  detalhes: string;
  usuario: {
    id: string;
    nomeAnonimo?: string;
    idade: number;
    email: string;
  };
  conversa: {
    textoUsuario: string;
    textoIa: string;
    dataHora: string;
    faixaEtaria: string;
  };
}

interface MembroEquipe {
  id: string;
  email: string;
  nome: string;
  funcao: string;
  disponivel: boolean;
}

interface Estatisticas {
  total: number;
  pendentes: number;
  emAnalise: number;
  resolvidos: number;
  porNivel: Record<string, number>;
  ultimos7Dias: number;
}

export default function AdminPanel() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [equipe, setEquipe] = useState<MembroEquipe[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'alertas' | 'equipe' | 'estatisticas'>('alertas');
  const [alertaSelecionado, setAlertaSelecionado] = useState<Alerta | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const [alertasRes, equipeRes, estatisticasRes] = await Promise.all([
        fetch('/api/alertas'),
        fetch('/api/equipe'),
        fetch('/api/alertas?tipo=estatisticas')
      ]);

      if (alertasRes.ok) {
        const alertasData = await alertasRes.json();
        setAlertas(alertasData.alertas || []);
      }

      if (equipeRes.ok) {
        const equipeData = await equipeRes.json();
        setEquipe(equipeData.membros || []);
      }

      if (estatisticasRes.ok) {
        const estatisticasData = await estatisticasRes.json();
        setEstatisticas(estatisticasData.estatisticas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusAlerta = async (alertaId: string, novoStatus: string) => {
    setAtualizandoStatus(alertaId);
    
    try {
      const response = await fetch('/api/alertas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertaId,
          novoStatus
        }),
      });

      if (response.ok) {
        // Atualizar estado local
        setAlertas(prev => prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, status: novoStatus as any }
            : alerta
        ));
        
        // Fechar modal se estava aberto
        if (alertaSelecionado?.id === alertaId) {
          setAlertaSelecionado(null);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setAtualizandoStatus(null);
    }
  };

  const toggleDisponibilidade = async (membroId: string, disponivel: boolean) => {
    try {
      const response = await fetch('/api/equipe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membroId,
          disponivel: !disponivel
        }),
      });

      if (response.ok) {
        setEquipe(prev => prev.map(membro => 
          membro.id === membroId 
            ? { ...membro, disponivel: !disponivel }
            : membro
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  const getRiscoColor = (nivel: string) => {
    switch (nivel) {
      case 'CRITICO': return 'text-red-600 bg-red-100';
      case 'ALTO': return 'text-orange-600 bg-orange-100';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-100';
      case 'BAIXO': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'text-red-600 bg-red-100';
      case 'EM_ANALISE': return 'text-yellow-600 bg-yellow-100';
      case 'RESOLVIDO': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Painel Administrativo - Amigo</h1>
                <p className="text-sm text-gray-600">Monitoramento e Suporte</p>
              </div>
            </div>

            <button
              onClick={carregarDados}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Estatísticas rápidas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Pendentes</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.pendentes}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Análise</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.emAnalise}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.resolvidos}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Últimos 7 dias</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.ultimos7Dias}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('alertas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alertas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Alertas ({alertas.filter(a => a.status !== 'RESOLVIDO').length})
              </button>
              
              <button
                onClick={() => setActiveTab('equipe')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'equipe'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Equipe ({equipe.filter(m => m.disponivel).length}/{equipe.length})
              </button>
              
              <button
                onClick={() => setActiveTab('estatisticas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'estatisticas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Estatísticas
              </button>
            </nav>
          </div>

          {/* Conteúdo das abas */}
          <div className="p-6">
            {activeTab === 'alertas' && (
              <div className="space-y-4">
                {alertas.filter(a => a.status !== 'RESOLVIDO').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum alerta pendente no momento.</p>
                    <p className="text-sm">Todos os usuários estão seguros!</p>
                  </div>
                ) : (
                  alertas
                    .filter(alerta => alerta.status !== 'RESOLVIDO')
                    .map((alerta) => (
                      <div
                        key={alerta.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiscoColor(alerta.nivelRisco)}`}>
                                {alerta.nivelRisco}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alerta.status)}`}>
                                {alerta.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(alerta.dataHora).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Usuário:</strong> {alerta.usuario.nomeAnonimo || 'Anônimo'} 
                                ({alerta.usuario.idade} anos, {alerta.conversa.faixaEtaria})
                              </p>
                              <p className="text-sm text-gray-800">
                                <strong>Mensagem:</strong> "{alerta.conversa.textoUsuario}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => setAlertaSelecionado(alerta)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {alerta.status === 'PENDENTE' && (
                              <button
                                onClick={() => atualizarStatusAlerta(alerta.id, 'EM_ANALISE')}
                                disabled={atualizandoStatus === alerta.id}
                                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                              >
                                {atualizandoStatus === alerta.id ? 'Atualizando...' : 'Analisar'}
                              </button>
                            )}

                            {alerta.status === 'EM_ANALISE' && (
                              <button
                                onClick={() => atualizarStatusAlerta(alerta.id, 'RESOLVIDO')}
                                disabled={atualizandoStatus === alerta.id}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {atualizandoStatus === alerta.id ? 'Atualizando...' : 'Resolver'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'equipe' && (
              <div className="space-y-4">
                {equipe.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${membro.disponivel ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">{membro.nome}</p>
                        <p className="text-sm text-gray-600">{membro.funcao}</p>
                        <p className="text-xs text-gray-500">{membro.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleDisponibilidade(membro.id, membro.disponivel)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                        membro.disponivel
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {membro.disponivel ? (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Marcar Indisponível</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Marcar Disponível</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'estatisticas' && estatisticas && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Alertas por Nível de Risco</h3>
                  <div className="space-y-3">
                    {Object.entries(estatisticas.porNivel).map(([nivel, quantidade]) => (
                      <div key={nivel} className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-sm ${getRiscoColor(nivel)}`}>
                          {nivel}
                        </span>
                        <span className="font-medium">{quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Resumo Geral</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de alertas:</span>
                      <span className="font-medium">{estatisticas.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Últimos 7 dias:</span>
                      <span className="font-medium">{estatisticas.ultimos7Dias}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de resolução:</span>
                      <span className="font-medium">
                        {estatisticas.total > 0 
                          ? Math.round((estatisticas.resolvidos / estatisticas.total) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalhes do alerta */}
      {alertaSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Detalhes do Alerta</h2>
                <button
                  onClick={() => setAlertaSelecionado(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nível de Risco</label>
                    <span className={`block mt-1 px-2 py-1 rounded text-sm w-fit ${getRiscoColor(alertaSelecionado.nivelRisco)}`}>
                      {alertaSelecionado.nivelRisco}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`block mt-1 px-2 py-1 rounded text-sm w-fit ${getStatusColor(alertaSelecionado.status)}`}>
                      {alertaSelecionado.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Usuário</label>
                  <p className="mt-1 text-sm text-gray-800">
                    {alertaSelecionado.usuario.nomeAnonimo || 'Anônimo'} 
                    ({alertaSelecionado.usuario.idade} anos, {alertaSelecionado.conversa.faixaEtaria})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Mensagem do Usuário</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">"{alertaSelecionado.conversa.textoUsuario}"</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Resposta da IA</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">"{alertaSelecionado.conversa.textoIa}"</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Detalhes da Análise</label>
                  <div className="mt-1 p-3 bg-yellow-50 rounded-lg">
                    <pre className="text-xs text-yellow-800 whitespace-pre-wrap">{alertaSelecionado.detalhes}</pre>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  {alertaSelecionado.status === 'PENDENTE' && (
                    <button
                      onClick={() => atualizarStatusAlerta(alertaSelecionado.id, 'EM_ANALISE')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Iniciar Análise
                    </button>
                  )}
                  
                  {alertaSelecionado.status === 'EM_ANALISE' && (
                    <button
                      onClick={() => atualizarStatusAlerta(alertaSelecionado.id, 'RESOLVIDO')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Marcar como Resolvido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
