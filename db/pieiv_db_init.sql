-- =====================================================================
-- pieiv_db — Script de inicialização (PostgreSQL 18)
-- Gerado a partir do dump em formato custom (pg_dump) enviado.
--
-- Uso:
--   1) Criar o banco (executar conectado a outro banco, ex.: postgres):
--        CREATE DATABASE pieiv_db WITH ENCODING = 'UTF8';
--   2) Conectar ao banco e rodar este script:
--        psql -U postgres -d pieiv_db -f pieiv_db_init.sql
-- =====================================================================

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

BEGIN;

-- ---------------------------------------------------------------------
-- Limpeza (permite reexecutar o script)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS public.agendamentos;
DROP TABLE IF EXISTS public.doacoes;
DROP TABLE IF EXISTS public.usuarios;

-- ---------------------------------------------------------------------
-- Tabela: usuarios
-- ---------------------------------------------------------------------
CREATE TABLE public.usuarios (
    id_usuario  SERIAL       PRIMARY KEY,
    nome_razao  VARCHAR(100) NOT NULL,
    tipo_perfil VARCHAR(20),
    documento   VARCHAR(20)  NOT NULL,
    CONSTRAINT usuarios_documento_key    UNIQUE (documento),
    CONSTRAINT usuarios_tipo_perfil_check
        CHECK (tipo_perfil IN ('FORNECEDOR', 'INSTITUICAO'))
);

-- ---------------------------------------------------------------------
-- Tabela: doacoes
-- ---------------------------------------------------------------------
CREATE TABLE public.doacoes (
    id_doacao     SERIAL       PRIMARY KEY,
    descricao     VARCHAR(255) NOT NULL,
    id_fornecedor INTEGER,
    status        VARCHAR(20)  DEFAULT 'DISPONIVEL',
    CONSTRAINT fk_fornecedor
        FOREIGN KEY (id_fornecedor) REFERENCES public.usuarios (id_usuario)
);

-- ---------------------------------------------------------------------
-- Tabela: agendamentos
-- ---------------------------------------------------------------------
CREATE TABLE public.agendamentos (
    id_agendamento SERIAL    PRIMARY KEY,
    id_doacao      INTEGER,
    id_instituicao INTEGER,
    data_retirada  TIMESTAMP NOT NULL,
    CONSTRAINT fk_doacao
        FOREIGN KEY (id_doacao)      REFERENCES public.doacoes  (id_doacao),
    CONSTRAINT fk_instituicao
        FOREIGN KEY (id_instituicao) REFERENCES public.usuarios (id_usuario)
);

-- ---------------------------------------------------------------------
-- Dados iniciais
-- ---------------------------------------------------------------------
INSERT INTO public.usuarios (id_usuario, nome_razao, tipo_perfil, documento) VALUES
    (1, 'Fornecedor Teste',  'FORNECEDOR',  '12345678901'),
    (2, 'Instituição Teste', 'INSTITUICAO', 'INST-TESTE-001');

INSERT INTO public.doacoes (id_doacao, descricao, id_fornecedor, status) VALUES
    (1, 'Cesta básica para teste', 1, 'RESERVADO');

INSERT INTO public.agendamentos (id_agendamento, id_doacao, id_instituicao, data_retirada) VALUES
    (1, 1, 2, '2026-11-25 14:00:00');

-- ---------------------------------------------------------------------
-- Ajuste das sequences (após inserts com IDs explícitos)
-- ---------------------------------------------------------------------
SELECT setval('public.usuarios_id_usuario_seq',           2, true);
SELECT setval('public.doacoes_id_doacao_seq',             1, true);
SELECT setval('public.agendamentos_id_agendamento_seq',   1, true);

COMMIT;
