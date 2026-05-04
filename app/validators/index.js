// app/validators/index.js — Validações com express-validator
'use strict';

const { body, param, query, validationResult } = require('express-validator');

// ─── Helper: executa as validações e trata erros ─────────────────────────────
/**
 * Middleware final da cadeia de validação.
 * - Se a requisição for AJAX/API → responde com JSON 422.
 * - Caso contrário → salva erros na sessão e redireciona para a página anterior.
 */
const handleValidation = (req, res, next) => {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    const isApi = req.xhr || (req.headers.accept || '').includes('application/json');

    if (isApi) {
      return res.status(422).json({ ok: false, errors: erros.array() });
    }

    // Web: guarda erros na sessão e volta para o formulário
    if (req.session) req.session.erros = erros.array();
    return res.redirect('back');
  }

  next();
};

// ─── Login ───────────────────────────────────────────────────────────────────
const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('O e-mail é obrigatório.')
    .isEmail().withMessage('Digite um e-mail válido.')
    .normalizeEmail(),

  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),

  handleValidation,
];

// ─── Cadastro de usuário ──────────────────────────────────────────────────────
const validarCadastro = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório.')
    .isLength({ min: 2, max: 100 })
    .withMessage('O nome deve ter entre 2 e 100 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('O e-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.')
    .normalizeEmail(),

  body('telefone')
    .optional({ checkFalsy: true })
    .isMobilePhone('pt-BR').withMessage('Telefone inválido. Use o formato (11) 91234-5678.'),

  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 8 }).withMessage('A senha deve ter pelo menos 8 caracteres.')
    .matches(/\d/).withMessage('A senha deve conter ao menos um número.')
    .matches(/[A-Z]/).withMessage('A senha deve conter ao menos uma letra maiúscula.'),

  body('confirmar')
    .notEmpty().withMessage('Confirme a senha.')
    .custom((value, { req }) => {
      if (value !== req.body.senha) throw new Error('As senhas não conferem.');
      return true;
    }),

  handleValidation,
];

// ─── Cadastro / edição de produto ─────────────────────────────────────────────
const validarProduto = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome do produto é obrigatório.')
    .isLength({ max: 120 }).withMessage('Nome muito longo (máx. 120 caracteres).'),

  body('preco')
    .notEmpty().withMessage('O preço é obrigatório.')
    .isFloat({ min: 0.01 }).withMessage('Preço inválido (mínimo R$ 0,01).')
    .toFloat(),

  body('preco_promo')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 }).withMessage('Preço promocional inválido.')
    .custom((value, { req }) => {
      if (parseFloat(value) >= parseFloat(req.body.preco)) {
        throw new Error('O preço promocional deve ser menor que o preço original.');
      }
      return true;
    })
    .toFloat(),

  body('estoque')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro não-negativo.')
    .toInt(),

  body('categoria_id')
    .notEmpty().withMessage('Selecione uma categoria.')
    .isInt({ min: 1 }).withMessage('Categoria inválida.')
    .toInt(),

  handleValidation,
];

// ─── Validação de :id em rotas ────────────────────────────────────────────────
const validarParamId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido.')
    .toInt(),

  handleValidation,
];

// ─── Parâmetros de busca / paginação ─────────────────────────────────────────
const validarBusca = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Busca muito longa (máx. 100 caracteres).'),

  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('Número de página inválido.')
    .toInt(),

  handleValidation,
];

// ─── Endereço ─────────────────────────────────────────────────────────────────
const validarEndereco = [
  body('logradouro')
    .trim().notEmpty().withMessage('Logradouro obrigatório.'),

  body('numero')
    .trim().notEmpty().withMessage('Número obrigatório.'),

  body('bairro')
    .trim().notEmpty().withMessage('Bairro obrigatório.'),

  body('cidade')
    .trim().notEmpty().withMessage('Cidade obrigatória.'),

  body('estado')
    .trim()
    .notEmpty().withMessage('Estado obrigatório.')
    .isLength({ min: 2, max: 2 }).withMessage('Use a sigla do estado (ex: SP).')
    .isAlpha().withMessage('Estado deve conter apenas letras.'),

  body('cep')
    .trim()
    .notEmpty().withMessage('CEP obrigatório.')
    .matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido (formato: 01310-100).'),

  handleValidation,
];

// ─── Status de pedido ─────────────────────────────────────────────────────────
const validarStatusPedido = [
  body('status')
    .notEmpty().withMessage('Status obrigatório.')
    .isIn(['pendente', 'pago', 'enviado', 'entregue', 'cancelado'])
    .withMessage('Status inválido.'),

  handleValidation,
];

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  handleValidation,
  validarLogin,
  validarCadastro,
  validarProduto,
  validarParamId,
  validarBusca,
  validarEndereco,
  validarStatusPedido,
};
