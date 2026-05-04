// app/models/Usuario.js — CRUD de usuários
'use strict';

const db = require('../../config/db');

class Usuario {
  // ── Listagem ──────────────────────────────────────────────

  /**
   * Retorna todos os usuários ativos com paginação.
   * @param {{ limite?: number, offset?: number }} opts
   */
  static async findAll({ limite = 50, offset = 0 } = {}) {
    const [rows] = await db.query(
      `SELECT id, nome, email, telefone, papel, ativo, criado_em
         FROM usuarios
        ORDER BY criado_em DESC
        LIMIT ? OFFSET ?`,
      [limite, offset]
    );
    return rows;
  }

  // ── Buscas unitárias ──────────────────────────────────────

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, nome, email, telefone, papel, ativo, criado_em
         FROM usuarios
        WHERE id = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  /** Retorna o registro completo (inclui senha_hash) para autenticação. */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0] ?? null;
  }

  // ── Criação ───────────────────────────────────────────────

  /**
   * Insere um novo usuário.
   * @returns {Promise<number>} ID inserido
   */
  static async create({ nome, email, senha_hash, telefone, papel = 'cliente' }) {
    const [result] = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, telefone, papel)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senha_hash, telefone ?? null, papel]
    );
    return result.insertId;
  }

  // ── Atualização ───────────────────────────────────────────

  /**
   * Atualiza campos permitidos do usuário.
   * @param {number} id
   * @param {object} campos  Apenas nome, email, telefone, papel, ativo são aceitos.
   * @returns {Promise<number>} Linhas afetadas
   */
  static async update(id, campos) {
    const permitidos = ['nome', 'email', 'telefone', 'papel', 'ativo'];
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
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  /** Atualiza apenas o hash da senha. */
  static async updateSenha(id, senha_hash) {
    const [result] = await db.query(
      'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
      [senha_hash, id]
    );
    return result.affectedRows;
  }

  // ── Remoção (soft-delete) ─────────────────────────────────

  /** Desativa o usuário sem removê-lo do banco. */
  static async delete(id) {
    const [result] = await db.query(
      'UPDATE usuarios SET ativo = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Usuario;
