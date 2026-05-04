require('dotenv').config();
const express = require('express');
const app  = express();
const port = process.env.PORT || 3000;

// Inicia pool de conexões (não bloqueia o servidor se falhar)
require('./config/db');

app.use(express.static('app/public'));
app.set('view engine', 'ejs');
app.set('views', './app/views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const rotas = require('./app/routes/router');
app.use('/', rotas);

// 404
app.use((req, res) => {
  res.status(404).render('pages/Home');
});

// Erros gerais
app.use((err, req, res, next) => {
  console.error('[Erro]', err.message);
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ ok: false, message: err.message });
  }
  res.status(500).render('pages/Home');
});

app.listen(port, () => {
  console.log(`\n🌿  Floria rodando em http://localhost:${port}`);
  console.log(`    Para conectar o banco, configure o arquivo .env\n`);
});
