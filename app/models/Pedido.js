// app/models/Pedido.js — CRUD de pedidos e itens
'use strict';

const db = require('../../config/db');

class Pedido {
  // ── Listagens ──────────────────────────────────────────────

  /** Todos os pedidos com dados do cliente (admin). */
  static async findAll({ limite = 50, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email
         FROM pedidos p
         JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY p.criado_em DESC
        LIMIT ? OFFSET ?`,
      [limite, offset]
    );
    return rows;
  }

  /** Pedidos de um usuário específico com contagem de itens. */
  static async findByUsuario(usuario_id) {
    const [rows] = await db.query(
      `SELECT p.*, COUNT(i.id) AS qtd_itens
         FROM pedidos p
         LEFT JOIN itens_pedido i ON i.pedido_id = p.id
        WHERE p.usuario_id = ?
        GROUP BY p.id
        ORDER BY p.criado_em DESC`,
      [usuario_id]
    );
    return rows;
  }

  // ── Busca unitária ─────────────────────────────────────────

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email
         FROM pedidos p
         JOIN usuarios u ON u.id = p.usuario_id
        WHERE p.id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /** Itens de um pedido com nome e imagem do produto. */
  static async itensDoPedido(pedido_id) {
    const [rows] = await db.query(
      `SELECT i.*, pr.nome AS produto_nome, pr.imagem
         FROM itens_pedido i
         JOIN produtos pr ON pr.id = i.produto_id
        WHERE i.pedido_id = ?`,
      [pedido_id]
    );
    return rows;
  }

  // ── Criação ────────────────────────────────────────────────

  /**
   * Cria um pedido com seus itens.
   * Suporta passar uma conexão ativa para uso em transações.
   *
   * @param {{ usuario_id, endereco_id?, total, forma_pagto? }} dados
   * @param {Array<{ produto_id, quantidade, preco_unit }>}      itens
   * @param {object|null} conn  Conexão de transação (opcional)
   * @returns {Promise<number>} ID do pedido criado
   */
  static async create({ usuario_id, endereco_id, total, forma_pagto }, itens = [], conn = null) {
    const cx = conn || db;

    const [result] = await cx.query(
      `INSERT INTO pedidos (usuario_id, endereco_id, total, forma_pagto)
       VALUES (?, ?, ?, ?)`,
      [usuario_id, endereco_id ?? null, total, forma_pagto ?? null]
    );

    const pedido_id = result.insertId;

    if (itens.length) {
      const valores = itens.map(i => [pedido_id, i.produto_id, i.quantidade, i.preco_unit]);
      await cx.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unit) VALUES ?',
        [valores]
      );
    }

    return pedido_id;
  }

  // ── Atualização de status ──────────────────────────────────

  static async atualizarStatus(id, status) {
    const validos = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];
    if (!validos.includes(status)) {
      throw new Error(`Status inválido: "${status}". Use: ${validos.join(', ')}`);
    }

    const [result] = await db.query(
      'UPDATE pedidos SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }
}

module.exports = Pedido;
