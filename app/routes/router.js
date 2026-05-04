const express  = require('express');
const router   = express.Router();

// Models
const Produto   = require('../models/Produto');
const Usuario   = require('../models/Usuario');
const Pedido    = require('../models/Pedido');
const Categoria = require('../models/Categoria');

// Validadores
const {
  validarLogin,
  validarCadastro,
  validarProduto,
  validarParamId,
} = require('../validators');

/* ═══════════════════════════════════════════════
   PÁGINAS PÚBLICAS
═══════════════════════════════════════════════ */
router.get('/', (req, res) => res.render('pages/Home'));
router.get('/pedidos', (req, res) => res.render('pages/Pedidos'));
router.get('/admin',   (req, res) => res.render('pages/index-adm'));
router.get('/estoque', (req, res) => res.render('pages/estoque'));
router.get('/maisvendidos', (req, res) => res.render('pages/MaisVendidos'));
router.get('/sobre-nos',    (req, res) => res.render('pages/sobre-nos'));
router.get('/presentear',   (req, res) => res.render('pages/Presentear'));
router.get('/carrinho',     (req, res) => res.render('pages/Carrinho'));
router.get('/pagamento',    (req, res) => res.render('pages/Pagamento'));
router.get('/detalhes',     (req, res) => res.render('pages/Detalhes'));
router.get('/detalhesv',    (req, res) => res.render('pages/DetalhesV'));
router.get('/login',        (req, res) => res.render('pages/Login'));
router.get('/login2',       (req, res) => res.render('pages/login2'));

/* ── Plantas (listagem dinâmica) ─── */
router.get('/plantas', async (req, res) => {
  try {
    const produtos = await Produto.findByCategoria('plantas');
    res.render('pages/plantas', { produtos });
  } catch (err) {
    console.error(err);
    res.render('pages/plantas', { produtos: [] });
  }
});

/* ── Vasos (listagem dinâmica) ─── */
router.get('/vasos', async (req, res) => {
  try {
    const produtos = await Produto.findByCategoria('vasos');
    res.render('pages/Vasos', { produtos });
  } catch (err) {
    console.error(err);
    res.render('pages/Vasos', { produtos: [] });
  }
});

/* ── Páginas de produto individuais ─── */
const paginasProduto = [
  'orquidea','alecrim','babosa','cacto','costeladeadao',
  'espadadesaojorge','hortela','jasmim','lavanda','manjericao','samambaia'
];
paginasProduto.forEach(slug => {
  router.get(`/${slug}`, (req, res) => res.render(`pages/${slug}`));
});

/* ═══════════════════════════════════════════════
   API — PRODUTOS
═══════════════════════════════════════════════ */

// Listagem
router.get('/api/produtos', async (req, res) => {
  try {
    const { categoria, limite = 50, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;
    const produtos = categoria
      ? await Produto.findByCategoria(categoria, { limite: +limite, offset })
      : await Produto.findAll({ limite: +limite, offset });
    res.json({ ok: true, data: produtos });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.get('/api/produtos/destaque', async (req, res) => {
  try {
    const produtos = await Produto.findDestaque(req.query.limite || 12);
    res.json({ ok: true, data: produtos });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Busca por ID
router.get('/api/produtos/:id', validarParamId, async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) return res.status(404).json({ ok: false, message: 'Produto não encontrado.' });
    res.json({ ok: true, data: produto });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Cadastrar produto (admin)
router.post('/api/produtos', validarProduto, async (req, res) => {
  try {
    const slug = req.body.slug || req.body.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = await Produto.create({ ...req.body, slug });
    res.status(201).json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Atualizar produto
router.put('/api/produtos/:id', validarParamId, validarProduto, async (req, res) => {
  try {
    const rows = await Produto.update(req.params.id, req.body);
    if (!rows) return res.status(404).json({ ok: false, message: 'Produto não encontrado.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Remover produto
router.delete('/api/produtos/:id', validarParamId, async (req, res) => {
  try {
    await Produto.delete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ═══════════════════════════════════════════════
   API — USUÁRIOS / AUTH
═══════════════════════════════════════════════ */

router.post('/api/login', validarLogin, async (req, res) => {
  try {
    const bcrypt  = require('bcrypt');
    const usuario = await Usuario.findByEmail(req.body.email);
    if (!usuario) return res.status(401).json({ ok: false, message: 'E-mail ou senha incorretos.' });
    const ok = await bcrypt.compare(req.body.senha, usuario.senha_hash);
    if (!ok) return res.status(401).json({ ok: false, message: 'E-mail ou senha incorretos.' });
    res.json({ ok: true, message: 'Login realizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.post('/api/cadastro', validarCadastro, async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const existe = await Usuario.findByEmail(req.body.email);
    if (existe) return res.status(409).json({ ok: false, message: 'E-mail já cadastrado.' });
    const senha_hash = await bcrypt.hash(req.body.senha, 12);
    const id = await Usuario.create({ ...req.body, senha_hash });
    res.status(201).json({ ok: true, message: 'Usuário cadastrado com sucesso!', id });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({ ok: true, data: usuarios });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ═══════════════════════════════════════════════
   API — PEDIDOS
═══════════════════════════════════════════════ */

router.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.findAll();
    res.json({ ok: true, data: pedidos });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.get('/api/pedidos/:id', validarParamId, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ ok: false, message: 'Pedido não encontrado.' });
    const itens = await Pedido.itensDoPedido(req.params.id);
    res.json({ ok: true, data: { ...pedido, itens } });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

router.patch('/api/pedidos/:id/status', validarParamId, async (req, res) => {
  try {
    await Pedido.atualizarStatus(req.params.id, req.body.status);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
});

/* ═══════════════════════════════════════════════
   API — CATEGORIAS
═══════════════════════════════════════════════ */

router.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json({ ok: true, data: categorias });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});


// Aliases case-insensitive
router.get('/Plantas',      (req, res) => res.redirect('/plantas'));
router.get('/Vasos',        (req, res) => res.redirect('/vasos'));
router.get('/MaisVendidos', (req, res) => res.redirect('/maisvendidos'));

module.exports = router;
