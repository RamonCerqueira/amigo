# Guia de Instalação - Projeto Amigo

Este guia fornece instruções detalhadas para configurar e executar o projeto Amigo em ambiente de desenvolvimento e produção.

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Versão Recomendada | Download |
|----------|---------------|-------------------|----------|
| Node.js | 18.x | 20.x LTS | [nodejs.org](https://nodejs.org) |
| npm | 9.x | 10.x | Incluído com Node.js |
| PostgreSQL | 13.x | 15.x | [postgresql.org](https://postgresql.org) |
| Git | 2.x | Mais recente | [git-scm.com](https://git-scm.com) |

### Contas e Chaves de API

- **OpenAI API Key** - Necessária para funcionalidades de IA
  - Acesse [platform.openai.com](https://platform.openai.com)
  - Crie uma conta e gere uma API key
  - Certifique-se de ter créditos disponíveis

## Instalação Rápida

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd amigo
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Banco de Dados

```bash
# Criar banco de dados PostgreSQL
createdb amigo_dev

# Configurar URL de conexão no .env
echo "DATABASE_URL=postgresql://usuario:senha@localhost:5432/amigo_dev" > .env
```

### 4. Configure as Variáveis de Ambiente

```bash
# Adicionar chave da OpenAI
echo "OPENAI_API_KEY=sk-sua-chave-aqui" >> .env
```

### 5. Execute as Migrações

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Inicie o Servidor

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Configuração Detalhada

### Configuração do Banco de Dados

#### PostgreSQL Local

1. **Instalar PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Baixar installer do site oficial
```

2. **Criar usuário e banco:**

```sql
-- Conectar como superusuário
sudo -u postgres psql

-- Criar usuário
CREATE USER amigo_user WITH PASSWORD 'senha_segura';

-- Criar banco de dados
CREATE DATABASE amigo_dev OWNER amigo_user;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE amigo_dev TO amigo_user;

-- Sair
\q
```

3. **Configurar URL de conexão:**

```bash
DATABASE_URL="postgresql://amigo_user:senha_segura@localhost:5432/amigo_dev"
```

#### PostgreSQL em Nuvem

**Supabase (Recomendado para desenvolvimento):**

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL de conexão do painel
4. Configure no arquivo `.env`

**Outras opções:**
- Railway
- PlanetScale
- Neon
- AWS RDS

### Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/amigo_dev"

# OpenAI API
OPENAI_API_KEY="sk-sua-chave-openai-aqui"

# Configurações da Aplicação
NEXTAUTH_SECRET="uma-chave-secreta-aleatoria-muito-longa"
NEXTAUTH_URL="http://localhost:3000"

# Email (Opcional - para notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

# Configurações de Desenvolvimento
NODE_ENV="development"
```

### Configuração da OpenAI

1. **Criar conta na OpenAI:**
   - Acesse [platform.openai.com](https://platform.openai.com)
   - Faça login ou crie uma conta

2. **Gerar API Key:**
   - Vá para "API Keys" no painel
   - Clique em "Create new secret key"
   - Copie a chave (ela só será mostrada uma vez)

3. **Configurar billing:**
   - Adicione um método de pagamento
   - Configure limites de uso se necessário

4. **Testar a integração:**

```bash
# Teste rápido da API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Executando o Projeto

### Modo Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar migrações
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

**Recursos disponíveis em desenvolvimento:**
- Hot reload automático
- Logs detalhados no console
- Prisma Studio: `npx prisma studio`
- Debugging habilitado

### Modo Produção

```bash
# Build da aplicação
npm run build

# Executar migrações de produção
npx prisma migrate deploy

# Iniciar servidor de produção
npm start
```

### Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Desenvolvimento | `npm run dev` | Inicia servidor de desenvolvimento |
| Build | `npm run build` | Compila aplicação para produção |
| Produção | `npm start` | Inicia servidor de produção |
| Lint | `npm run lint` | Verifica qualidade do código |
| Prisma Studio | `npx prisma studio` | Interface visual do banco |
| Testes | `node tests/api.test.js` | Executa testes de API |

## Configuração de Produção

### Variáveis de Ambiente de Produção

```bash
# Banco de dados de produção
DATABASE_URL="postgresql://user:pass@prod-host:5432/amigo_prod"

# OpenAI com rate limiting
OPENAI_API_KEY="sk-prod-key"

# Segurança
NEXTAUTH_SECRET="chave-super-secreta-de-producao-256-bits"
NEXTAUTH_URL="https://amigo.app"

# Email de produção
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASS="sua-api-key-sendgrid"

# Configurações de produção
NODE_ENV="production"
```

### Deploy com Docker

1. **Criar Dockerfile:**

```dockerfile
FROM node:20-alpine AS base

# Dependências
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

2. **Build e execução:**

```bash
# Build da imagem
docker build -t amigo-app .

# Executar container
docker run -p 3000:3000 --env-file .env amigo-app
```

### Deploy com Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/amigo
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=amigo
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Verificação da Instalação

### 1. Verificar Serviços

```bash
# Verificar se o servidor está rodando
curl http://localhost:3000

# Verificar banco de dados
npx prisma db pull

# Verificar OpenAI
node -e "
const { Configuration, OpenAIApi } = require('openai');
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);
console.log('OpenAI configurado com sucesso');
"
```

### 2. Executar Testes

```bash
# Testes de API
node tests/api.test.js

# Verificar se todas as rotas respondem
curl http://localhost:3000/api/health
```

### 3. Verificar PWA

1. Abra o navegador em `http://localhost:3000`
2. Abra DevTools (F12)
3. Vá para a aba "Application"
4. Verifique se o Service Worker está registrado
5. Verifique se o Manifest está carregado

## Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```
Error: P1001: Can't reach database server
```

**Soluções:**
- Verificar se PostgreSQL está rodando
- Confirmar URL de conexão no `.env`
- Verificar firewall e permissões

#### 2. Erro da OpenAI API

```
Error: 401 Unauthorized
```

**Soluções:**
- Verificar se a API key está correta
- Confirmar se há créditos na conta
- Verificar se a key não expirou

#### 3. Erro de Build

```
Error: Module not found
```

**Soluções:**
- Executar `npm install` novamente
- Limpar cache: `npm cache clean --force`
- Deletar `node_modules` e reinstalar

#### 4. Erro de Migração

```
Error: Migration failed
```

**Soluções:**
- Verificar se o banco está acessível
- Executar `npx prisma db push` para forçar
- Verificar logs do PostgreSQL

### Logs e Debugging

#### Habilitar Logs Detalhados

```bash
# Logs do Prisma
DEBUG="prisma:*" npm run dev

# Logs do Next.js
DEBUG="*" npm run dev

# Logs personalizados
NODE_ENV=development npm run dev
```

#### Verificar Logs do Sistema

```bash
# Logs do PostgreSQL (Ubuntu)
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Logs do aplicativo
tail -f logs/app.log
```

## Configurações Avançadas

### Performance

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  poweredByHeader: false,
};
```

### Segurança

```javascript
// Headers de segurança
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];
```

### Monitoramento

```bash
# Instalar ferramentas de monitoramento
npm install --save-dev clinic autocannon

# Análise de performance
clinic doctor -- node server.js
clinic bubbleprof -- node server.js
```

## Suporte

### Recursos Úteis

- **Documentação Técnica:** `DOCUMENTACAO_TECNICA.md`
- **Logs de Desenvolvimento:** Console do navegador
- **Prisma Studio:** `npx prisma studio`
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

### Contato

Para suporte técnico ou dúvidas sobre a instalação:

- Verifique a documentação técnica completa
- Consulte os logs de erro
- Execute os testes de verificação
- Revise as configurações de ambiente

---

**Guia criado por:** Manus AI  
**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0
