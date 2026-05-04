-- ============================================================
--  FLORIA — Script completo do banco de dados
--  Execute: mysql -u root -p < config/database.sql
--  Ou no MySQL Workbench: File > Run SQL Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS floria
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE floria;

-- ──────────────────────────────────────────
-- TABELA: usuarios
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED       AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100)       NOT NULL,
  email         VARCHAR(150)       NOT NULL UNIQUE,
  senha_hash    VARCHAR(255)       NOT NULL,
  telefone      VARCHAR(20)        DEFAULT NULL,
  papel         ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  ativo         TINYINT(1)         NOT NULL DEFAULT 1,
  criado_em     TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────
-- TABELA: categorias
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(80)   NOT NULL UNIQUE,
  slug        VARCHAR(80)   NOT NULL UNIQUE,
  descricao   TEXT          DEFAULT NULL,
  criado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados iniciais de categorias
INSERT IGNORE INTO categorias (nome, slug, descricao) VALUES
  ('Plantas',    'plantas',    'Mudas, flores, árvores e sementes'),
  ('Vasos',      'vasos',      'Vasos, cachepôs e suportes'),
  ('Decorações', 'decoracoes', 'Itens decorativos para jardim');

-- ──────────────────────────────────────────
-- TABELA: produtos
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produtos (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  categoria_id  INT UNSIGNED   NOT NULL,
  nome          VARCHAR(120)   NOT NULL,
  slug          VARCHAR(120)   NOT NULL UNIQUE,
  descricao     TEXT           DEFAULT NULL,
  preco         DECIMAL(10,2)  NOT NULL,
  preco_promo   DECIMAL(10,2)  DEFAULT NULL,
  estoque       INT            NOT NULL DEFAULT 0,
  imagem        VARCHAR(255)   DEFAULT NULL,
  destaque      TINYINT(1)     NOT NULL DEFAULT 0,
  ativo         TINYINT(1)     NOT NULL DEFAULT 1,
  criado_em     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id)
    REFERENCES categorias(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produtos iniciais
INSERT IGNORE INTO produtos
  (categoria_id, nome, slug, descricao, preco, estoque, imagem, destaque)
VALUES
  -- Plantas
  (1, 'Muda de Comigo Ninguém Pode', 'comigo-ninguem-pode',
      'Planta tropical de interior, ideal para ambientes com pouca luz.',
      211.25, 30, 'Muda.png', 1),
  (1, 'Samambaia', 'samambaia',
      'Planta de sombra, ótima para varandas.', 111.25, 45, 'samambaia.webp', 1),
  (1, 'Alecrim',   'alecrim',
      'Erva aromática, ideal para cozinha.',      70.25, 60, 'alecrim.jpg',   0),
  (1, 'Babosa',    'babosa',
      'Suculenta medicinal de fácil cultivo.',   116.25, 50, 'baboda.jpg',    1),
  (1, 'Cacto',     'cacto',
      'Resistente e decorativo, pouca rega.',     61.25, 80, 'cacto.webp',    0),
  (1, 'Costela de Adão', 'costela-de-adao',
      'Folhas marcantes, símbolo de ambientes modernos.',
      80.25, 25, 'costeladeadao.webp', 1),
  (1, 'Orquídea',  'orquidea',
      'Flor elegante em diversas cores.',         99.99, 35, 'orquidea.jpg',  1),
  (1, 'Lavanda',   'lavanda',
      'Aroma inconfundível, flor lilás.',         49.99, 70, 'lavanda.jpg',   0),
  (1, 'Jasmim',    'jasmim',
      'Trepadeira perfumada.',                    75.00, 40, 'jasmim.png',    0),
  (1, 'Hortelã',   'hortela',
      'Erva refrescante para drinks e cozinha.',  78.25, 55, 'hortela.png',   0),
  -- Vasos
  (2, 'Vaso Autoirrigável', 'vaso-autoirrigavel',
      'Reservatório embutido, rega automática.',  90.00, 20, 'VasoAutoirrigavel.png', 1),
  (2, 'Vaso de Barro Tradicional', 'vaso-barro-tradicional',
      'Barro natural, ótima aeração das raízes.', 40.00, 35, 'VasoBarroTradicional.png', 0),
  (2, 'Vaso Autoirrigável Transparente', 'vaso-autoirrigavel-transparente',
      'Veja o nível de água sem abrir.',          95.00, 18, 'VasoAutoirrigavelTransparente.png', 0),
  (2, 'Vaso de Barro', 'vaso-de-barro',
      'Acabamento artesanal em barro.',           45.00, 30, 'vaso-de-barro.png', 0),
  (2, 'Vaso de Cerâmica Azul', 'vaso-ceramica-azul',
      'Esmaltado em azul vibrante.',              95.00, 22, 'vaso-ceramica-azul.png', 1);

-- ──────────────────────────────────────────
-- TABELA: enderecos
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enderecos (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED  NOT NULL,
  logradouro  VARCHAR(200)  NOT NULL,
  numero      VARCHAR(20)   NOT NULL,
  complemento VARCHAR(80)   DEFAULT NULL,
  bairro      VARCHAR(100)  NOT NULL,
  cidade      VARCHAR(100)  NOT NULL,
  estado      CHAR(2)       NOT NULL,
  cep         VARCHAR(9)    NOT NULL,
  principal   TINYINT(1)    NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────
-- TABELA: pedidos
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT UNSIGNED  NOT NULL,
  endereco_id   INT UNSIGNED  DEFAULT NULL,
  status        ENUM('pendente','pago','enviado','entregue','cancelado')
                              NOT NULL DEFAULT 'pendente',
  total         DECIMAL(10,2) NOT NULL,
  forma_pagto   VARCHAR(50)   DEFAULT NULL,
  criado_em     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT,
  FOREIGN KEY (endereco_id)
    REFERENCES enderecos(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────
-- TABELA: itens_pedido
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS itens_pedido (
  id          INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  pedido_id   INT UNSIGNED   NOT NULL,
  produto_id  INT UNSIGNED   NOT NULL,
  quantidade  INT            NOT NULL DEFAULT 1,
  preco_unit  DECIMAL(10,2)  NOT NULL,
  FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id)
    ON DELETE CASCADE,
  FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────
-- ÍNDICES de desempenho
-- ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_produtos_categoria  ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque   ON produtos(destaque);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo      ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario     ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status      ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_enderecos_usuario   ON enderecos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido        ON itens_pedido(pedido_id);
