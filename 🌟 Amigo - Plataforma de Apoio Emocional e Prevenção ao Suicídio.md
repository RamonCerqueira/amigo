# 🌟 Amigo - Plataforma de Apoio Emocional e Prevenção ao Suicídio

> **Uma solução web completa para combater o suicídio, ansiedade e depressão através de conversas empáticas por voz com IA, monitoramento profissional e design acolhedor.**

![Amigo Banner](https://via.placeholder.com/800x300/FCD34D/FFFFFF?text=Amigo+-+Apoio+Emocional+24%2F7)

## 📋 Visão Geral

O **Amigo** é uma plataforma inovadora que oferece apoio emocional 24/7 através de conversas por voz com inteligência artificial empática. O sistema foi desenvolvido especificamente para combater o suicídio, ansiedade, depressão e outros problemas sociais, proporcionando um ambiente seguro e acolhedor para pessoas que se sentem solitárias.

### 🎯 Missão
Salvar vidas através de tecnologia empática, oferecendo apoio emocional imediato e conectando pessoas em situação de risco com profissionais qualificados.

## ✨ Funcionalidades Principais

### 🗣️ **Conversa por Voz Inteligente**
- **IA Empática**: Conversas naturais com ChatGPT configurado para apoio emocional
- **Reconhecimento de Voz**: Transcrição automática com Whisper (OpenAI)
- **Síntese de Voz**: Respostas em áudio com vozes feminina e masculina
- **Interface Híbrida**: Opção de conversar por voz ou texto
- **Seleção de Voz**: Escolha entre voz feminina (calorosa) e masculina (reconfortante)

### 🛡️ **Sistema de Monitoramento e Alertas**
- **Detecção Automática de Risco**: 4 níveis (BAIXO, MÉDIO, ALTO, CRÍTICO)
- **Análise de Palavras-Chave**: Identificação de sinais de alerta
- **Alertas em Tempo Real**: Notificação imediata para equipe de apoio
- **Contextualização por Idade**: Respostas apropriadas para cada faixa etária
- **Histórico Completo**: Rastreamento de padrões comportamentais

### 🏥 **Módulo de Monitoramento Profissional**
- **Acesso Separado**: Sistema dedicado para equipe de apoio (`/monitoramento`)
- **Dashboard em Tempo Real**: Estatísticas e alertas atualizados automaticamente
- **Gestão de Casos**: Triagem, acompanhamento e resolução de alertas
- **Controle de Permissões**: Diferentes níveis de acesso por função
- **Logs de Auditoria**: Rastreamento completo de todas as ações

### 🎨 **Design Acolhedor e Acessível**
- **Paleta Calorosa**: Amarelo, laranja e verde para transmitir esperança
- **Gradientes Suaves**: Backgrounds que inspiram tranquilidade
- **Animações Gentis**: Micro-interações que humanizam a experiência
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **PWA**: Instalável como aplicativo nativo no celular

### 🔐 **Segurança e Privacidade**
- **Verificação por Email**: Código de 6 dígitos para ativação de conta
- **Dados Protegidos**: Criptografia e armazenamento seguro
- **Anonimização**: Proteção da identidade quando necessário
- **LGPD Compliant**: Conformidade com leis de proteção de dados

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Next.js 15** - Framework React para produção
- **TypeScript** - Tipagem estática para maior confiabilidade
- **Tailwind CSS** - Estilização utilitária com paleta personalizada
- **Lucide Icons** - Ícones modernos e consistentes
- **PWA** - Progressive Web App para instalação nativa

### **Backend**
- **Next.js API Routes** - APIs serverless integradas
- **Prisma ORM** - Gerenciamento de banco de dados tipado
- **PostgreSQL** - Banco de dados relacional robusto
- **Zod** - Validação de esquemas em tempo de execução

### **Inteligência Artificial**
- **OpenAI GPT-4** - Conversas empáticas e contextuais
- **Whisper** - Reconhecimento de fala de alta qualidade
- **Text-to-Speech** - Síntese de voz natural
- **Análise de Sentimento** - Detecção automática de risco emocional

### **Infraestrutura**
- **Vercel** - Deploy e hospedagem otimizada
- **JWT** - Autenticação segura para equipe de apoio
- **Service Workers** - Funcionalidades offline
- **Web APIs** - MediaRecorder, SpeechRecognition, Notifications

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- PostgreSQL 14+
- Conta OpenAI com API Key
- Git

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/amigo.git
cd amigo
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/amigo"

# OpenAI
OPENAI_API_KEY="sk-sua-chave-openai-aqui"

# JWT (gere uma chave segura)
JWT_SECRET="sua-chave-jwt-super-secreta"

# Email (opcional - para produção)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# URLs
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-nextauth"
```

### **4. Configure o Banco de Dados**
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# (Opcional) Visualizar banco
npx prisma studio
```

### **5. Execute o Projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### **6. Acesse a Aplicação**
- **App Principal**: http://localhost:3000
- **Monitoramento**: http://localhost:3000/monitoramento
- **Emergência**: http://localhost:3000/emergencia

## 👥 Credenciais de Demonstração

### **Usuários Regulares**
- Registre-se normalmente através da interface

### **Equipe de Monitoramento**
| Função | Email | Senha | Permissões |
|--------|-------|-------|------------|
| Coordenador | `admin@apoio.com` | `admin123` | Todas |
| Psicólogo | `psicologo@apoio.com` | `psi123` | Leitura/Escrita |
| Enfermeiro | `enfermeiro@apoio.com` | `enf123` | Somente Leitura |

## 📱 Funcionalidades PWA

O Amigo pode ser instalado como aplicativo nativo:

### **Instalação**
1. Acesse o site no navegador
2. Clique no ícone de instalação que aparece
3. Confirme a instalação
4. Use como app nativo!

### **Recursos Offline**
- Cache inteligente de recursos essenciais
- Funcionalidade básica sem internet
- Sincronização automática quando voltar online

## 🔧 Estrutura do Projeto

```
amigo/
├── src/
│   ├── app/                    # Páginas e API routes
│   │   ├── api/               # APIs backend
│   │   ├── monitoramento/     # Módulo de apoio
│   │   ├── registro/          # Cadastro de usuários
│   │   ├── login/             # Autenticação
│   │   └── dashboard/         # Painel do usuário
│   ├── components/            # Componentes React
│   │   ├── ConversaVoz.tsx   # Interface de conversa
│   │   └── InstallPWA.tsx    # Instalação PWA
│   ├── lib/                   # Utilitários e configurações
│   │   ├── openai.ts         # Integração OpenAI
│   │   ├── prisma.ts         # Cliente banco de dados
│   │   ├── auth.ts           # Autenticação
│   │   └── validations.ts    # Validações Zod
│   └── middleware.ts          # Middleware Next.js
├── prisma/
│   └── schema.prisma          # Schema do banco
├── public/
│   ├── manifest.json          # Manifesto PWA
│   └── sw.js                  # Service Worker
├── tests/                     # Testes automatizados
└── docs/                      # Documentação
```

## 🧪 Testes

### **Executar Testes**
```bash
# Testes de funcionalidade
node tests/funcionalidades.test.js

# Testes de API (com servidor rodando)
npm run test:api
```

### **Cobertura de Testes**
- ✅ Autenticação e autorização
- ✅ APIs de conversa e áudio
- ✅ Sistema de alertas
- ✅ Módulo de monitoramento
- ✅ Validações de entrada
- ✅ PWA e Service Workers

## 📊 Métricas e Monitoramento

### **Dashboard de Estatísticas**
- Total de conversas realizadas
- Alertas gerados por nível de risco
- Taxa de resolução de casos
- Usuários ativos por período
- Tempo médio de resposta da equipe

### **Análise de Impacto**
- Redução de episódios críticos
- Melhoria no bem-estar dos usuários
- Eficácia das intervenções
- Padrões de uso por faixa etária

## 🌍 Deploy em Produção

### **Vercel (Recomendado)**
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### **Outras Plataformas**
- **AWS**: Amplify, EC2, RDS
- **Google Cloud**: App Engine, Cloud SQL
- **Azure**: App Service, PostgreSQL

### **Configurações Importantes**
- Configure domínio personalizado
- Ative HTTPS obrigatório
- Configure backup automático do banco
- Monitore logs e performance

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Diretrizes**
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Documente mudanças significativas
- Mantenha commits pequenos e focados

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte e Contato

### **Recursos de Emergência**
- **CVV**: 188 (24h, gratuito)
- **SAMU**: 192
- **Bombeiros**: 193
- **Polícia**: 190

### **Suporte Técnico**
- **Email**: suporte@amigo.com
- **GitHub Issues**: [Reportar Bug](https://github.com/seu-usuario/amigo/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/amigo/wiki)

## 🙏 Agradecimentos

- **OpenAI** pela tecnologia de IA empática
- **Vercel** pela plataforma de deploy
- **Comunidade Open Source** pelas bibliotecas utilizadas
- **Profissionais de Saúde Mental** pelas orientações
- **Usuários Beta** pelo feedback valioso

---

<div align="center">

**🌟 Desenvolvido com ❤️ para salvar vidas 🌟**

*Se você ou alguém que conhece está passando por dificuldades, lembre-se: você não está sozinho. Procure ajuda.*

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://amigo-app.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

</div>
