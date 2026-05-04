// config/db.js — Pool de conexões MySQL com reconexão e fallback gracioso
// Dependências: npm install mysql2 dotenv
'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

// ──────────────────────────────────────────────────────────
//  Configuração do pool
// ──────────────────────────────────────────────────────────
const poolConfig = {
  host:               process.env.DB_HOST             || 'localhost',
  port:               Number(process.env.DB_PORT)      || 3306,
  user:               process.env.DB_USER             || 'root',
  password:           process.env.DB_PASS             || '',
  database:           process.env.DB_NAME             || 'floria',

  // Encoding
  charset:            'utf8mb4',

  // Pool
  connectionLimit:    Number(process.env.DB_POOL_LIMIT) || 10,
  queueLimit:         Number(process.env.DB_POOL_QUEUE) || 0,   // 0 = sem limite
  waitForConnections: true,

  // Keep-alive para evitar que conexões idle sejam derrubadas pelo servidor
  enableKeepAlive:       true,
  keepAliveInitialDelay: 30_000,   // 30 s

  // Timeout de conexão
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 10_000,

  // Retorna datas como objetos Date do JavaScript
  dateStrings: false,

  // Converte valores BIGINT em números JS (cuidado com precisão acima de 2^53)
  supportBigNumbers: true,
  bigNumberStrings:  false,
};

// ──────────────────────────────────────────────────────────
//  Instância do pool (singleton)
// ──────────────────────────────────────────────────────────
let pool = null;

/**
 * Cria o pool e testa a conexão ao iniciar o processo.
 * Se o banco não estiver disponível, o servidor sobe mesmo assim
 * e exibe um aviso no console.
 */
async function inicializar() {
  try {
    pool = mysql.createPool(poolConfig);

    // Teste rápido: pega uma conexão e a devolve imediatamente
    const conn = await pool.getConnection();
    console.log(
      `✅  Banco de dados conectado — ${poolConfig.database}@${poolConfig.host}:${poolConfig.port}`
    );
    console.log(
      `    Pool: ${poolConfig.connectionLimit} conexões máx., keep-alive ativo`
    );
    conn.release();
  } catch (err) {
    pool = null;
    console.warn('\n⚠️   Banco de dados indisponível:', err.message);
    console.warn(
      '     O servidor vai funcionar sem banco.\n' +
      '     Corrija as variáveis DB_* no arquivo .env e reinicie.\n'
    );
  }
}

// Executa ao importar o módulo
inicializar();

// ──────────────────────────────────────────────────────────
//  Proxy: garante mensagem descritiva se pool não existir
// ──────────────────────────────────────────────────────────
const semBanco = (..._args) =>
  Promise.reject(
    new Error(
      'Banco de dados não conectado. ' +
      'Verifique as variáveis DB_* no arquivo .env e reinicie o servidor.'
    )
  );

const poolProxy = new Proxy(
  {},
  {
    get(_, prop) {
      if (!pool) {
        // query, execute, getConnection, end — retorna função que rejeita
        return semBanco;
      }
      const val = pool[prop];
      return typeof val === 'function' ? val.bind(pool) : val;
    },
  }
);

module.exports = poolProxy;
