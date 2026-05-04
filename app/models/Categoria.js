// app/models/Categoria.js — CRUD de categorias
'use strict';

const db = require('../../config/db');

class Categoria {
  // ── Listagem ──────────────────────────────────────────────

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY nome');
    return rows;
  }

  // ── Buscas unitárias ──────────────────────────────────────

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );
    return rows[0] ?? null;
  }

  static async findBySlug(slug) {
    const [rows] = await db.query(
      'SELECT * FROM categorias WHERE slug = ?',
      [slug]
    );
    return rows[0] ?? null;
  }

  // ── Criação ───────────────────────────────────────────────

  /**
   * @returns {Promise<number>} ID inserido
   */
  static async create({ nome, slug, descricao }) {
    const [result] = await db.query(
      'INSERT INTO categorias (nome, slug, descricao) VALUES (?, ?, ?)',
      [nome, slug, descricao ?? null]
    );
    return result.insertId;
  }

  // ── Atualização ───────────────────────────────────────────

  static async update(id, campos) {
    const permitidos = ['nome', 'slug', 'descricao'];
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
      `UPDATE categorias SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  // ── Remoção ───────────────────────────────────────────────

  /**
   * Remove a categoria (hard-delete).
   * Falhará se houver produtos vinculados (FK RESTRICT).
   */
  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Categoria;
