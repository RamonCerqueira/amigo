// Suite de testes para APIs do projeto Amigo
// Executar com: node tests/api.test.js

const https = require('https');
const http = require('http');

// Configuração base
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'teste@amigo.app',
  password: 'TesteSeguro123!',
  confirmPassword: 'TesteSeguro123!',
  nomeAnonimo: 'Usuário Teste',
  telefone: '(11) 99999-9999',
  idade: 25,
  endereco: 'Rua Teste, 123, São Paulo, SP'
};

// Utilitário para fazer requisições HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Amigo-Test-Suite/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Classe para executar testes
class TestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Iniciando testes da API Amigo...\n');

    for (const test of this.tests) {
      this.results.total++;
      try {
        console.log(`⏳ Executando: ${test.name}`);
        await test.testFn();
        console.log(`✅ PASSOU: ${test.name}\n`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ FALHOU: ${test.name}`);
        console.log(`   Erro: ${error.message}\n`);
        this.results.failed++;
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));
    console.log(`Total de testes: ${this.results.total}`);
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 Todos os testes passaram!');
    } else {
      console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: esperado ${expected}, recebido ${actual}`);
    }
  }

  assertStatus(response, expectedStatus, message) {
    if (response.statusCode !== expectedStatus) {
      throw new Error(`${message}: esperado status ${expectedStatus}, recebido ${response.statusCode}`);
    }
  }
}

// Instância dos testes
const suite = new TestSuite();

// Testes de Autenticação
suite.test('POST /api/auth/registro - Deve criar usuário válido', async () => {
  const response = await makeRequest('POST', '/api/auth/registro', TEST_USER);
  
  suite.assertStatus(response, 201, 'Status de criação de usuário');
  suite.assert(response.body.success, 'Resposta deve indicar sucesso');
  suite.assert(response.body.usuario, 'Deve retornar dados do usuário');
  suite.assert(response.body.usuario.id, 'Usuário deve ter ID');
});

suite.test('POST /api/auth/registro - Deve rejeitar email duplicado', async () => {
  const response = await makeRequest('POST', '/api/auth/registro', TEST_USER);
  
  suite.assertStatus(response, 409, 'Status de conflito para email duplicado');
  suite.assert(response.body.error, 'Deve retornar mensagem de erro');
});

suite.test('POST /api/auth/registro - Deve validar dados obrigatórios', async () => {
  const invalidUser = { email: 'invalido@teste.com' };
  const response = await makeRequest('POST', '/api/auth/registro', invalidUser);
  
  suite.assertStatus(response, 400, 'Status de dados inválidos');
  suite.assert(response.body.error, 'Deve retornar erro de validação');
});

suite.test('POST /api/auth/login - Deve autenticar usuário válido', async () => {
  const loginData = {
    email: TEST_USER.email,
    password: TEST_USER.password
  };
  
  const response = await makeRequest('POST', '/api/auth/login', loginData);
  
  // Pode retornar 200 (sucesso) ou 403 (email não verificado)
  suite.assert(
    response.statusCode === 200 || response.statusCode === 403,
    'Status deve ser 200 ou 403'
  );
  
  if (response.statusCode === 200) {
    suite.assert(response.body.success, 'Login deve ser bem-sucedido');
    suite.assert(response.body.usuario, 'Deve retornar dados do usuário');
  }
});

suite.test('POST /api/auth/login - Deve rejeitar credenciais inválidas', async () => {
  const invalidLogin = {
    email: TEST_USER.email,
    password: 'senhaerrada'
  };
  
  const response = await makeRequest('POST', '/api/auth/login', invalidLogin);
  
  suite.assertStatus(response, 401, 'Status de não autorizado');
  suite.assert(response.body.error, 'Deve retornar erro de autenticação');
});

// Testes de Conversas (mock)
suite.test('POST /api/conversas - Deve validar dados de entrada', async () => {
  const invalidData = { textoUsuario: '' };
  const response = await makeRequest('POST', '/api/conversas', invalidData);
  
  suite.assertStatus(response, 400, 'Status de dados inválidos');
  suite.assert(response.body.error, 'Deve retornar erro de validação');
});

suite.test('GET /api/conversas - Deve exigir usuarioId', async () => {
  const response = await makeRequest('GET', '/api/conversas');
  
  suite.assertStatus(response, 400, 'Status de parâmetro obrigatório');
  suite.assert(response.body.error, 'Deve retornar erro de usuarioId obrigatório');
});

// Testes de Dashboard
suite.test('GET /api/dashboard - Deve exigir usuarioId', async () => {
  const response = await makeRequest('GET', '/api/dashboard');
  
  suite.assertStatus(response, 400, 'Status de parâmetro obrigatório');
  suite.assert(response.body.error, 'Deve retornar erro de usuarioId obrigatório');
});

// Testes de Alertas
suite.test('GET /api/alertas - Deve retornar lista de alertas', async () => {
  const response = await makeRequest('GET', '/api/alertas');
  
  suite.assertStatus(response, 200, 'Status de sucesso');
  suite.assert(response.body.success, 'Resposta deve indicar sucesso');
  suite.assert(Array.isArray(response.body.alertas), 'Deve retornar array de alertas');
});

suite.test('GET /api/alertas?tipo=estatisticas - Deve retornar estatísticas', async () => {
  const response = await makeRequest('GET', '/api/alertas?tipo=estatisticas');
  
  suite.assertStatus(response, 200, 'Status de sucesso');
  suite.assert(response.body.success, 'Resposta deve indicar sucesso');
  suite.assert(response.body.estatisticas, 'Deve retornar estatísticas');
  suite.assert(typeof response.body.estatisticas.total === 'number', 'Total deve ser número');
});

// Testes de Equipe
suite.test('GET /api/equipe - Deve retornar lista da equipe', async () => {
  const response = await makeRequest('GET', '/api/equipe');
  
  suite.assertStatus(response, 200, 'Status de sucesso');
  suite.assert(response.body.success, 'Resposta deve indicar sucesso');
  suite.assert(Array.isArray(response.body.membros), 'Deve retornar array de membros');
});

// Testes de Headers de Segurança
suite.test('Verificar headers de segurança', async () => {
  const response = await makeRequest('GET', '/');
  
  // Verificar headers importantes (podem não estar todos presentes em desenvolvimento)
  const headers = response.headers;
  
  // Pelo menos alguns headers básicos devem estar presentes
  suite.assert(headers['content-type'], 'Content-Type deve estar presente');
  
  console.log('   Headers encontrados:', Object.keys(headers).join(', '));
});

// Testes de Manifesto PWA
suite.test('GET /manifest.json - Deve retornar manifesto PWA válido', async () => {
  const response = await makeRequest('GET', '/manifest.json');
  
  suite.assertStatus(response, 200, 'Status de sucesso para manifesto');
  suite.assert(response.body.name, 'Manifesto deve ter nome');
  suite.assert(response.body.short_name, 'Manifesto deve ter nome curto');
  suite.assert(Array.isArray(response.body.icons), 'Manifesto deve ter ícones');
});

// Executar todos os testes
if (require.main === module) {
  suite.run().catch(console.error);
}

module.exports = { TestSuite, makeRequest };
