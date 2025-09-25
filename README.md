# 🤝 Amigo - Plataforma de Apoio Emocional

Uma solução web completa para prevenção de suicídio e apoio emocional, utilizando conversas por voz com inteligência artificial empática e sistema de monitoramento especializado.

![Amigo Banner](https://via.placeholder.com/800x200/3B82F6/FFFFFF?text=Amigo+-+Apoio+Emocional)

## 🌟 Características Principais

- **💬 Conversas por Voz Empáticas** - IA treinada para apoio emocional 24/7
- **🛡️ Sistema de Alertas Inteligente** - Detecção automática de situações de risco
- **👥 Equipe de Apoio Especializada** - Profissionais monitoram e oferecem suporte
- **📱 Progressive Web App (PWA)** - Instalação nativa em dispositivos móveis
- **🔒 Segurança e Privacidade** - Dados protegidos e conversas confidenciais
- **🌐 Funcionalidades Offline** - Recursos essenciais disponíveis sem internet

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com SSR/SSG
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS** - Framework de estilos utilitários
- **Lucide React** - Biblioteca de ícones moderna
- **Web APIs** - MediaRecorder, Speech Recognition

### Backend
- **Next.js API Routes** - Endpoints serverless
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Banco de dados relacional robusto
- **Zod** - Validação de schemas TypeScript-first

### Integrações
- **OpenAI API** - GPT-4, Whisper (STT), TTS
- **Service Worker** - Cache e funcionalidades offline
- **PWA Manifest** - Instalação nativa

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior
- **PostgreSQL** 13.x ou superior
- **OpenAI API Key** - Para funcionalidades de IA
- **npm** ou **yarn** - Gerenciador de pacotes

## ⚡ Instalação Rápida

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd amigo

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Configure o banco de dados
npx prisma migrate dev --name init
npx prisma generate

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/amigo_dev"

# OpenAI API
OPENAI_API_KEY="sk-sua-chave-openai-aqui"

# Configurações da Aplicação
NEXTAUTH_SECRET="uma-chave-secreta-aleatoria-muito-longa"
NEXTAUTH_URL="http://localhost:3000"

# Email (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

### Configuração do Banco de Dados

```sql
-- Criar banco de dados PostgreSQL
CREATE DATABASE amigo_dev;
CREATE USER amigo_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE amigo_dev TO amigo_user;
```

## 📖 Documentação

- **[📚 Documentação Técnica](DOCUMENTACAO_TECNICA.md)** - Arquitetura e implementação detalhada
- **[🛠️ Guia de Instalação](INSTALACAO.md)** - Instruções completas de configuração
- **[🧪 Testes](tests/)** - Suite de testes automatizados

## 🏗️ Estrutura do Projeto

```
amigo/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Painel do usuário
│   │   ├── admin/             # Painel administrativo
│   │   └── emergencia/        # Recursos de emergência
│   ├── components/            # Componentes React
│   └── lib/                   # Utilitários e configurações
├── prisma/                    # Schema e migrações do banco
├── public/                    # Arquivos estáticos e PWA
├── tests/                     # Testes automatizados
└── docs/                      # Documentação adicional
```

## 🎯 Funcionalidades

### Para Usuários
- **Conversa por Voz** - Interface natural e empática
- **Apoio 24/7** - Disponível a qualquer momento
- **Privacidade Total** - Conversas confidenciais e seguras
- **Recursos de Emergência** - Acesso rápido a ajuda profissional
- **Desenvolvimento Pessoal** - Ferramentas de bem-estar

### Para Equipe de Apoio
- **Painel Administrativo** - Monitoramento em tempo real
- **Sistema de Alertas** - Notificações automáticas de risco
- **Gestão de Casos** - Acompanhamento de usuários
- **Estatísticas** - Métricas de performance e impacto

## 🔒 Segurança e Privacidade

- **Criptografia** - Dados sensíveis protegidos
- **Headers de Segurança** - Proteção contra ataques comuns
- **Validação Rigorosa** - Entrada de dados sanitizada
- **Logs de Auditoria** - Rastreamento de ações críticas
- **LGPD Compliance** - Conformidade com proteção de dados

## 🚨 Sistema de Alertas

### Níveis de Risco

| Nível | Tempo de Resposta | Ação |
|-------|------------------|------|
| 🔴 **CRÍTICO** | Imediato | Contato direto + emergência |
| 🟠 **ALTO** | 1 hora | Contato urgente + suporte |
| 🟡 **MÉDIO** | 4 horas | Contato + recursos |
| 🟢 **BAIXO** | 24 horas | Monitoramento |

### Palavras-chave Monitoradas

- **Críticas:** "quero morrer", "vou me matar", "suicídio"
- **Altas:** "sem saída", "sem esperança", "não aguento mais"
- **Médias:** "muito triste", "deprimido", "sozinho"
- **Baixas:** "triste", "ansioso", "preocupado"

## 📱 PWA (Progressive Web App)

### Recursos Offline
- Cache inteligente de recursos essenciais
- Funcionalidade básica sem internet
- Sincronização automática quando online

### Instalação Nativa
- Ícone na tela inicial
- Experiência de app nativo
- Notificações push (futuro)

## 🧪 Testes

```bash
# Executar testes de API
node tests/api.test.js

# Verificar funcionalidades
npm run test

# Testes de integração
npm run test:integration
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t amigo-app .
docker run -p 3000:3000 --env-file .env amigo-app
```

## 📊 Monitoramento

### Métricas Importantes
- **Tempo de Resposta** - Latência das APIs
- **Taxa de Erro** - Erros do sistema
- **Alertas Pendentes** - Casos não processados
- **Uso de Recursos** - CPU e memória

### Health Check
```bash
curl http://localhost:3000/api/health
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código TypeScript
- Adicione testes para novas funcionalidades
- Mantenha a documentação atualizada
- Respeite as diretrizes de segurança

## 📞 Recursos de Emergência

### Telefones Importantes
- **CVV:** 188 (24h gratuito)
- **SAMU:** 192
- **Polícia:** 190
- **Bombeiros:** 193

### Links Úteis
- [CVV - Centro de Valorização da Vida](https://www.cvv.org.br)
- [Mapa da Saúde Mental](https://mapadasaudemental.com.br)
- [CAPS - Centros de Atenção Psicossocial](https://portalms.saude.gov.br)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **OpenAI** - Pela tecnologia de IA empática
- **CVV** - Pela inspiração e metodologia de apoio
- **Comunidade Open Source** - Pelas ferramentas e bibliotecas
- **Profissionais de Saúde Mental** - Pela orientação especializada

## 📈 Roadmap

### Versão 1.1
- [ ] Autenticação JWT completa
- [ ] Notificações push
- [ ] Suporte a múltiplos idiomas
- [ ] Analytics avançados

### Versão 1.2
- [ ] Integração com calendário
- [ ] Grupos de apoio
- [ ] Recursos de meditação
- [ ] API pública

### Versão 2.0
- [ ] Aplicativo móvel nativo
- [ ] Integração com wearables
- [ ] IA personalizada por usuário
- [ ] Plataforma de treinamento

## 📞 Suporte

Para suporte técnico ou dúvidas:

- 📧 **Email:** suporte@amigo.app
- 📖 **Documentação:** [Guia Técnico](DOCUMENTACAO_TECNICA.md)
- 🐛 **Issues:** [GitHub Issues](https://github.com/projeto-amigo/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/projeto-amigo/discussions)

---

<div align="center">

**Feito com ❤️ para apoiar vidas**

[Website](https://amigo.app) • [Documentação](DOCUMENTACAO_TECNICA.md) • [Instalação](INSTALACAO.md) • [Contribuir](#contribuição)

</div>
