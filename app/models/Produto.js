// app/models/Produto.js — CRUD de produtos
'use strict';

const db = require('../../config/db');

class Produto {
  // ── Listagens ──────────────────────────────────────────────

  /** Todos os produtos ativos com nome da categoria. */
  static async findAll({ limite = 50, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON c.id = p.categoria_id
        WHERE p.ativo = 1
        ORDER BY p.nome
        LIMIT ? OFFSET ?`,
      [limite, offset]
    );
    return rows;
  }

  /** Produtos de uma categoria pelo slug. */
  static async findByCategoria(slug, { limite = 50, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON c.id = p.categoria_id
        WHERE c.slug = ? AND p.ativo = 1
        ORDER BY p.nome
        LIMIT ? OFFSET ?`,
      [slug, limite, offset]
    );
    return rows;
  }

  /** Produtos em destaque (para home / carrossel). */
  static async findDestaque(limite = 12) {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON c.id = p.categoria_id
        WHERE p.ativo = 1 AND p.destaque = 1
        ORDER BY p.criado_em DESC
        LIMIT ?`,
      [limite]
    );
    return rows;
  }

  // ── Busca unitária ─────────────────────────────────────────

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON c.id = p.categoria_id
        WHERE p.id = ? AND p.ativo = 1`,
      [id]
    );
    return rows[0] ?? null;
  }

  static async findBySlug(slug) {
    const [rows] = await db.query(
      `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p
         JOIN categorias c ON c.id = p.categoria_id
        WHERE p.slug = ? AND p.ativo = 1`,
      [slug]
    );
    return rows[0] ?? null;
  }

  // ── Criação ────────────────────────────────────────────────

  /**
   * @returns {Promise<number>} ID inserido
   */
  static async create({
    categoria_id, nome, slug, descricao,
    preco, preco_promo, estoque, imagem, destaque,
  }) {
    const [result] = await db.query(
      `INSERT INTO produtos
         (categoria_id, nome, slug, descricao, preco, preco_promo, estoque, imagem, destaque)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoria_id,
        nome,
        slug,
        descricao  ?? null,
        preco,
        preco_promo ?? null,
        estoque    ?? 0,
        imagem     ?? null,
        destaque   ? 1 : 0,
      ]
    );
    return result.insertId;
  }

  // ── Atualização ────────────────────────────────────────────

  static async update(id, campos) {
    const permitidos = [
      'nome', 'slug', 'descricao', 'preco', 'preco_promo',
      'estoque', 'imagem', 'destaque', 'ativo', 'categoria_id',
    ];
    const sets   = [];
    const values = [];

    for (const [k, v] of Object.entries(campos)) {
      if (permitidos.includes(k)) {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }

    if (!sets.length) return 0;

    values.push(id);
    const [result] = await db.query(
      `UPDATE produtos SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  // ── Remoção (soft-delete) ──────────────────────────────────

  static async delete(id) {
    const [result] = await db.query(
      'UPDATE produtos SET ativo = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // ── Estoque ────────────────────────────────────────────────

  /**
   * Decrementa o estoque de forma atômica (sem ultrapassar zero).
   * @returns {Promise<boolean>} true se conseguiu decrementar
   */
  static async decrementarEstoque(id, qtd = 1) {
    const [result] = await db.query(
      'UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?',
      [qtd, id, qtd]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Produto;
