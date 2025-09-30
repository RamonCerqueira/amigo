/**
 * Suite de Testes - Projeto Amigo
 * Testa todas as funcionalidades principais implementadas
 */

const BASE_URL = 'http://localhost:3000';

// Cores para output no console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  yellow: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData = null;
    
    try {
      jsonData = JSON.parse(data);
    } catch {
      // Se não for JSON, retorna como texto
      jsonData = { text: data, status: response.status };
    }
    
    return {
      status: response.status,
      data: jsonData,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

// Dados de teste
const testData = {
  usuario: {
    email: 'teste@amigo.com',
    senha: 'teste123456',
    nomeAnonimo: 'Teste Usuario',
    telefone: '(11) 99999-9999',
    idade: 25,
    endereco: 'Rua Teste, 123, São Paulo, SP'
  },
  conversa: {
    textoUsuario: 'Olá, como você está?',
    usuarioId: 'test-user-id'
  },
  monitoramento: {
    email: 'admin@apoio.com',
    senha: 'admin123'
  }
};

// Testes das APIs
const tests = [
  {
    name: '🏠 Página Principal',
    test: async () => {
      const response = await makeRequest('/');
      return response.status === 200;
    }
  },
  
  {
    name: '📝 Página de Registro',
    test: async () => {
      const response = await makeRequest('/registro');
      return response.status === 200;
    }
  },
  
  {
    name: '🔐 Página de Login',
    test: async () => {
      const response = await makeRequest('/login');
      return response.status === 200;
    }
  },
  
  {
    name: '🏥 Módulo de Monitoramento',
    test: async () => {
      const response = await makeRequest('/monitoramento');
      return response.status === 200;
    }
  },
  
  {
    name: '📊 Dashboard de Monitoramento',
    test: async () => {
      const response = await makeRequest('/monitoramento/dashboard');
      return response.status === 200;
    }
  },
  
  {
    name: '🚨 Página de Emergência',
    test: async () => {
      const response = await makeRequest('/emergencia');
      return response.status === 200;
    }
  },
  
  {
    name: '📱 PWA Manifest',
    test: async () => {
      const response = await makeRequest('/manifest.json');
      return response.status === 200 && response.data.name;
    }
  },
  
  {
    name: '⚙️ Service Worker',
    test: async () => {
      const response = await makeRequest('/sw.js');
      return response.status === 200;
    }
  },
  
  {
    name: '🔧 API - Registro de Usuário (Validação)',
    test: async () => {
      const response = await makeRequest('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({
          email: 'email-invalido',
          senha: '123'
        })
      });
      // Deve retornar erro de validação
      return response.status === 400;
    }
  },
  
  {
    name: '🔑 API - Login (Credenciais Inválidas)',
    test: async () => {
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'inexistente@teste.com',
          senha: 'senhaerrada'
        })
      });
      // Deve retornar erro de autenticação
      return response.status === 401;
    }
  },
  
  {
    name: '💬 API - Conversas (Sem Autenticação)',
    test: async () => {
      const response = await makeRequest('/api/conversas', {
        method: 'GET'
      });
      // Deve retornar erro de autenticação ou dados vazios
      return response.status === 401 || response.status === 200;
    }
  },
  
  {
    name: '🤖 API - OpenAI (Validação de Entrada)',
    test: async () => {
      const response = await makeRequest('/api/conversas/openai', {
        method: 'POST',
        body: JSON.stringify({
          // Dados inválidos propositalmente
          mensagem: '',
          usuarioId: ''
        })
      });
      // Deve retornar erro de validação
      return response.status === 400 || response.status === 401;
    }
  },
  
  {
    name: '🎤 API - Speech-to-Text (Sem Arquivo)',
    test: async () => {
      const response = await makeRequest('/api/audio/stt', {
        method: 'POST',
        body: JSON.stringify({})
      });
      // Deve retornar erro por falta de arquivo
      return response.status === 400;
    }
  },
  
  {
    name: '🔊 API - Text-to-Speech (Validação)',
    test: async () => {
      const response = await makeRequest('/api/audio/tts', {
        method: 'POST',
        body: JSON.stringify({
          texto: '',
          voz: 'invalida'
        })
      });
      // Deve retornar erro de validação
      return response.status === 400;
    }
  },
  
  {
    name: '🏥 API - Login Monitoramento (Credenciais Demo)',
    test: async () => {
      const response = await makeRequest('/api/monitoramento/auth/login', {
        method: 'POST',
        body: JSON.stringify(testData.monitoramento)
      });
      // Deve aceitar credenciais de demonstração
      return response.status === 200 && response.data.success;
    }
  },
  
  {
    name: '📋 API - Alertas (Sem Autenticação)',
    test: async () => {
      const response = await makeRequest('/api/monitoramento/alertas', {
        method: 'GET'
      });
      // Deve retornar erro de autenticação
      return response.status === 401;
    }
  },
  
  {
    name: '📊 API - Estatísticas (Sem Autenticação)',
    test: async () => {
      const response = await makeRequest('/api/monitoramento/estatisticas', {
        method: 'GET'
      });
      // Deve retornar erro de autenticação
      return response.status === 401;
    }
  }
];

// Função principal para executar todos os testes
async function runTests() {
  log('🧪 INICIANDO TESTES DO PROJETO AMIGO', 'bold');
  log('=' .repeat(50), 'yellow');
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const testCase of tests) {
    try {
      log(`\n⏳ Testando: ${testCase.name}`, 'yellow');
      
      const startTime = Date.now();
      const result = await testCase.test();
      const duration = Date.now() - startTime;
      
      if (result) {
        log(`✅ PASSOU (${duration}ms)`, 'green');
        passed++;
        results.push({ name: testCase.name, status: 'PASSOU', duration });
      } else {
        log(`❌ FALHOU (${duration}ms)`, 'red');
        failed++;
        results.push({ name: testCase.name, status: 'FALHOU', duration });
      }
    } catch (error) {
      log(`💥 ERRO: ${error.message}`, 'red');
      failed++;
      results.push({ name: testCase.name, status: 'ERRO', error: error.message });
    }
  }
  
  // Resumo dos resultados
  log('\n' + '=' .repeat(50), 'yellow');
  log('📊 RESUMO DOS TESTES', 'bold');
  log('=' .repeat(50), 'yellow');
  
  log(`✅ Testes que passaram: ${passed}`, 'green');
  log(`❌ Testes que falharam: ${failed}`, 'red');
  log(`📊 Total de testes: ${tests.length}`, 'yellow');
  log(`🎯 Taxa de sucesso: ${Math.round((passed / tests.length) * 100)}%`, 'yellow');
  
  // Detalhes dos resultados
  log('\n📋 DETALHES DOS RESULTADOS:', 'bold');
  log('-' .repeat(50), 'yellow');
  
  results.forEach(result => {
    const statusColor = result.status === 'PASSOU' ? 'green' : 'red';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    log(`${result.status}: ${result.name}${duration}`, statusColor);
    
    if (result.error) {
      log(`   Erro: ${result.error}`, 'red');
    }
  });
  
  log('\n🏁 TESTES CONCLUÍDOS!', 'bold');
  
  // Notas importantes
  log('\n📝 NOTAS IMPORTANTES:', 'yellow');
  log('• Para testes completos, inicie o servidor: npm run dev', 'yellow');
  log('• Configure as variáveis de ambiente necessárias', 'yellow');
  log('• Alguns testes podem falhar sem o banco de dados configurado', 'yellow');
  log('• Os testes de validação devem falhar propositalmente', 'yellow');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, tests };
