-- CreateEnum
CREATE TYPE "FaixaEtaria" AS ENUM ('CRIANCA', 'ADOLESCENTE', 'JOVEM_ADULTO', 'ADULTO', 'IDOSO');

-- CreateEnum
CREATE TYPE "NivelRisco" AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nome_anonimo" TEXT,
    "telefone" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "endereco" TEXT NOT NULL,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acesso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "codigo_verificacao" TEXT,
    "codigo_expires_em" TIMESTAMP(3),
    "conta_ativa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "texto_usuario" TEXT NOT NULL,
    "texto_ia" TEXT NOT NULL,
    "risco_detectado" BOOLEAN NOT NULL DEFAULT false,
    "idade_usuario" INTEGER NOT NULL,
    "faixa_etaria" "FaixaEtaria" NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "conversa_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel_risco" "NivelRisco" NOT NULL,
    "status" "StatusAlerta" NOT NULL DEFAULT 'PENDENTE',
    "detalhes" TEXT NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipe_de_apoio" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipe_de_apoio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_verificacao_email" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "sucesso" BOOLEAN NOT NULL DEFAULT false,
    "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_verificacao_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "equipe_de_apoio_email_key" ON "equipe_de_apoio"("email");

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_verificacao_email" ADD CONSTRAINT "logs_verificacao_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
