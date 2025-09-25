-- CreateEnum
CREATE TYPE "public"."FaixaEtaria" AS ENUM ('CRIANCA', 'ADOLESCENTE', 'JOVEM_ADULTO', 'ADULTO', 'IDOSO');

-- CreateEnum
CREATE TYPE "public"."NivelRisco" AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "public"."StatusAlerta" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "public"."usuarios" (
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
CREATE TABLE "public"."conversas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "texto_usuario" TEXT NOT NULL,
    "texto_ia" TEXT NOT NULL,
    "risco_detectado" BOOLEAN NOT NULL DEFAULT false,
    "idade_usuario" INTEGER NOT NULL,
    "faixa_etaria" "public"."FaixaEtaria" NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alertas" (
    "id" TEXT NOT NULL,
    "conversa_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel_risco" "public"."NivelRisco" NOT NULL,
    "status" "public"."StatusAlerta" NOT NULL DEFAULT 'PENDENTE',
    "detalhes" TEXT NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipe_de_apoio" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipe_de_apoio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs_verificacao_email" (
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
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "public"."usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "equipe_de_apoio_email_key" ON "public"."equipe_de_apoio"("email");

-- AddForeignKey
ALTER TABLE "public"."conversas" ADD CONSTRAINT "conversas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alertas" ADD CONSTRAINT "alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs_verificacao_email" ADD CONSTRAINT "logs_verificacao_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
