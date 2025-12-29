/**
 * Servidor Proxy Seguro - Loteria Encruzilhada
 * Com Autenticação JWT e Gerenciamento de Usuários
 * Deploy: Railway
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// CONFIGURAÇÕES
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'trocar-em-producao-chave-muito-segura';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL;
const NOCODB_TOKEN = process.env.NOCODB_TOKEN;
const TABLE_BOLOES_ID = process.env.NOCODB_TABLE_ID;
const TABLE_USUARIOS_ID = process.env.NOCODB_TABLE_USUARIOS_ID;

// Validação de inicialização
const requiredEnvVars = ['NOCODB_BASE_URL', 'NOCODB_TOKEN', 'NOCODB_TABLE_ID', 'NOCODB_TABLE_USUARIOS_ID'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ Variáveis obrigatórias faltando:', missingVars.join(', '));
  process.exit(1);
}

// ============================================
// MIDDLEWARES DE SEGURANÇA
// ============================================

app.use(helmet());
app.set('trust proxy', 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.trim()))) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Limite de operações atingido.' }
});

app.use(express.json({ limit: '10kb' }));

// ============================================
// ROLES E PERMISSÕES
// ============================================

const ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  VENDEDOR: 'vendedor'
};

const PERMISSIONS = {
  // Bolões
  'boloes:criar': [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR],
  'boloes:listar': [ROLES.ADMIN, ROLES.GERENTE, ROLES.VENDEDOR],
  'boloes:listar_todos': [ROLES.ADMIN, ROLES.GERENTE],
  'boloes:editar': [ROLES.ADMIN, ROLES.GERENTE],
  'boloes:editar_proprio': [ROLES.VENDEDOR],
  'boloes:deletar': [ROLES.ADMIN, ROLES.GERENTE],

  // Usuários
  'usuarios:listar': [ROLES.ADMIN, ROLES.GERENTE],
  'usuarios:criar': [ROLES.ADMIN],
  'usuarios:editar': [ROLES.ADMIN],
  'usuarios:deletar': [ROLES.ADMIN],

  // Relatórios
  'relatorios:ver': [ROLES.ADMIN, ROLES.GERENTE]
};

function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) || false;
}

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
}

// ============================================
// COMUNICAÇÃO COM NOCODB
// ============================================

async function nocodbRequest(method, endpoint, body = null) {
  const url = `${NOCODB_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      'xc-token': NOCODB_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`NocoDB Error: ${response.status}`, errorText);
    throw new Error(`NocoDB: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ============================================
// VALIDAÇÕES
// ============================================

function validateBolao(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!data.nome_cliente?.trim()) errors.push('Nome do cliente é obrigatório');
    if (!data.descricao_bolao?.trim()) errors.push('Descrição do bolão é obrigatória');
    if (!data.data_compra) errors.push('Data da compra é obrigatória');
  }

  if (data.nome_cliente && data.nome_cliente.length > 200) {
    errors.push('Nome muito longo (máx. 200 caracteres)');
  }

  if (data.valor !== undefined) {
    const valor = parseFloat(data.valor);
    if (isNaN(valor) || valor < 10) errors.push('Valor mínimo: R$ 10,00');
    if (valor > 100000) errors.push('Valor máximo excedido');
  }

  if (data.data_compra) {
    const dataCompra = new Date(data.data_compra);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    if (dataCompra > hoje) errors.push('Data não pode ser futura');
  }

  const tiposPagamento = ['PIX', 'Cartão de Crédito', 'Dinheiro'];
  if (data.tipo_pagamento && !tiposPagamento.includes(data.tipo_pagamento)) {
    errors.push('Tipo de pagamento inválido');
  }

  const contasBancarias = ['Asaas', 'Caixa Econômica'];
  if (data.conta_bancaria && !contasBancarias.includes(data.conta_bancaria)) {
    errors.push('Conta bancária inválida');
  }

  const statusValidos = ['Pago', 'Pendente', 'Cancelado'];
  if (data.status && !statusValidos.includes(data.status)) {
    errors.push('Status inválido');
  }

  return errors;
}

function validateUsuario(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!data.nome?.trim()) errors.push('Nome é obrigatório');
    if (!data.email?.trim()) errors.push('Email é obrigatório');
    if (!data.senha || data.senha.length < 6) {
      errors.push('Senha deve ter no mínimo 6 caracteres');
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido');
  }

  if (data.role && !Object.values(ROLES).includes(data.role)) {
    errors.push('Cargo inválido');
  }

  if (data.senha && data.senha.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  return errors;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function sanitizeData(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'senha') {
      sanitized[key] = value;
    } else {
      sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
    }
  }
  return sanitized;
}

// ============================================
// ROTAS PÚBLICAS
// ============================================

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Bolões API', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTENTICAÇÃO
// ============================================

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const endpoint = `/tables/${TABLE_USUARIOS_ID}/records?where=(email,eq,${encodeURIComponent(email.toLowerCase().trim())})`;
    const result = await nocodbRequest('GET', endpoint);

    if (!result.list || result.list.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = result.list[0];

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário desativado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: usuario.Id, email: usuario.email, nome: usuario.nome, role: usuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await nocodbRequest('PATCH', `/tables/${TABLE_USUARIOS_ID}/records`, {
      Id: usuario.Id,
      ultimo_acesso: new Date().toISOString()
    });

    res.json({
      token,
      usuario: { id: usuario.Id, nome: usuario.nome, email: usuario.email, role: usuario.role }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await nocodbRequest('GET', `/tables/${TABLE_USUARIOS_ID}/records/${req.user.id}`);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou desativado' });
    }

    res.json({ id: usuario.Id, nome: usuario.nome, email: usuario.email, role: usuario.role });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro ao obter dados do usuário' });
  }
});

app.post('/api/auth/alterar-senha', authenticateToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    const usuario = await nocodbRequest('GET', `/tables/${TABLE_USUARIOS_ID}/records/${req.user.id}`);
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await nocodbRequest('PATCH', `/tables/${TABLE_USUARIOS_ID}/records`, {
      Id: req.user.id,
      senha: senhaHash
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

app.get('/api/usuarios', authenticateToken, requirePermission('usuarios:listar'), async (req, res) => {
  try {
    const { ativo } = req.query;
    let endpoint = `/tables/${TABLE_USUARIOS_ID}/records?sort=-created_at&limit=100`;

    if (ativo !== undefined) {
      endpoint += `&where=(ativo,eq,${ativo === 'true'})`;
    }

    const data = await nocodbRequest('GET', endpoint);

    const usuarios = (data.list || []).map(u => ({
      id: u.Id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      ativo: u.ativo,
      ultimo_acesso: u.ultimo_acesso,
      create_at: u.created_at
    }));

    res.json({ list: usuarios });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

app.post('/api/usuarios', authenticateToken, requirePermission('usuarios:criar'), strictLimiter, async (req, res) => {
  try {
    const validationErrors = validateUsuario(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const { nome, email, senha, role = ROLES.VENDEDOR } = req.body;

    const existing = await nocodbRequest('GET',
      `/tables/${TABLE_USUARIOS_ID}/records?where=(email,eq,${encodeURIComponent(email.toLowerCase().trim())})`
    );

    if (existing.list && existing.list.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      nome: sanitizeString(nome),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      role,
      ativo: true
    };

    const data = await nocodbRequest('POST', `/tables/${TABLE_USUARIOS_ID}/records`, novoUsuario);

    res.status(201).json({
      id: data.Id,
      nome: data.nome,
      email: data.email,
      role: data.role,
      ativo: data.ativo
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.patch('/api/usuarios/:id', authenticateToken, requirePermission('usuarios:editar'), strictLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const validationErrors = validateUsuario(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const updateData = { Id: parseInt(id) };

    if (req.body.nome) updateData.nome = sanitizeString(req.body.nome);
    if (req.body.email) updateData.email = req.body.email.toLowerCase().trim();
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.ativo !== undefined) updateData.ativo = req.body.ativo;
    if (req.body.senha) updateData.senha = await bcrypt.hash(req.body.senha, 10);

    await nocodbRequest('PATCH', `/tables/${TABLE_USUARIOS_ID}/records`, updateData);

    const usuario = await nocodbRequest('GET', `/tables/${TABLE_USUARIOS_ID}/records/${id}`);

    res.json({
      id: usuario.Id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/usuarios/:id', authenticateToken, requirePermission('usuarios:deletar'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível desativar seu próprio usuário' });
    }

    await nocodbRequest('PATCH', `/tables/${TABLE_USUARIOS_ID}/records`, {
      Id: parseInt(id),
      ativo: false
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// ============================================
// ROTAS DE BOLÕES
// ============================================

app.get('/api/boloes', authenticateToken, async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let endpoint = `/tables/${TABLE_BOLOES_ID}/records?limit=${Math.min(limit, 100)}&offset=${offset}`;

    const filters = [];

    if (req.user.role === ROLES.VENDEDOR) {
      filters.push(`(vendedor_id,eq,${req.user.id})`);
    }

    if (status) filters.push(`(status,eq,${status})`);
    if (search) filters.push(`(nome_cliente,like,${search})`);

    if (filters.length > 0) {
      endpoint += `&where=${filters.join('~and')}`;
    }

    endpoint += '&sort=-created_at';

    const data = await nocodbRequest('GET', endpoint);
    res.json(data);
  } catch (error) {
    console.error('Erro ao listar:', error);
    res.status(500).json({ error: 'Erro ao buscar bolões' });
  }
});

app.get('/api/boloes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const data = await nocodbRequest('GET', `/tables/${TABLE_BOLOES_ID}/records/${id}`);

    if (req.user.role === ROLES.VENDEDOR && data.vendedor_id !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar:', error);
    res.status(500).json({ error: 'Erro ao buscar bolão' });
  }
});

app.post('/api/boloes', authenticateToken, requirePermission('boloes:criar'), strictLimiter, async (req, res) => {
  try {
    const validationErrors = validateBolao(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const sanitizedData = sanitizeData(req.body);
    sanitizedData.status = sanitizedData.status || 'Pendente';
    sanitizedData.vendedor_id = req.user.id;
    sanitizedData.vendedor_nome = req.user.nome;

    const data = await nocodbRequest('POST', `/tables/${TABLE_BOLOES_ID}/records`, sanitizedData);
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao criar:', error);
    res.status(500).json({ error: 'Erro ao criar bolão' });
  }
});

app.patch('/api/boloes/:id', authenticateToken, strictLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const bolao = await nocodbRequest('GET', `/tables/${TABLE_BOLOES_ID}/records/${id}`);

    const isOwner = bolao.vendedor_id === req.user.id;
    const canEditAll = hasPermission(req.user.role, 'boloes:editar');
    const canEditOwn = hasPermission(req.user.role, 'boloes:editar_proprio') && isOwner;

    if (!canEditAll && !canEditOwn) {
      return res.status(403).json({ error: 'Sem permissão para editar este bolão' });
    }

    const validationErrors = validateBolao(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const sanitizedData = sanitizeData(req.body);
    sanitizedData.Id = parseInt(id);

    const data = await nocodbRequest('PATCH', `/tables/${TABLE_BOLOES_ID}/records`, sanitizedData);
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ error: 'Erro ao atualizar bolão' });
  }
});

app.delete('/api/boloes/:id', authenticateToken, requirePermission('boloes:deletar'), strictLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await nocodbRequest('DELETE', `/tables/${TABLE_BOLOES_ID}/records/${id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar bolão' });
  }
});

// ============================================
// RELATÓRIOS
// ============================================

app.get('/api/relatorios/resumo', authenticateToken, requirePermission('relatorios:ver'), async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    let endpoint = `/tables/${TABLE_BOLOES_ID}/records?limit=1000`;

    const filters = [];
    if (dataInicio) filters.push(`(data_compra,gte,${dataInicio})`);
    if (dataFim) filters.push(`(data_compra,lte,${dataFim})`);

    if (filters.length > 0) {
      endpoint += `&where=${filters.join('~and')}`;
    }

    const data = await nocodbRequest('GET', endpoint);
    const boloes = data.list || [];

    const resumo = {
      total: boloes.length,
      valorTotal: boloes.reduce((sum, b) => sum + (parseFloat(b.valor) || 0), 0),
      porStatus: {},
      porPagamento: {},
      porConta: {},
      porVendedor: {}
    };

    boloes.forEach(b => {
      resumo.porStatus[b.status] = (resumo.porStatus[b.status] || 0) + 1;

      if (b.tipo_pagamento) {
        resumo.porPagamento[b.tipo_pagamento] = (resumo.porPagamento[b.tipo_pagamento] || 0) + 1;
      }

      if (b.conta_bancaria) {
        resumo.porConta[b.conta_bancaria] = (resumo.porConta[b.conta_bancaria] || 0) + 1;
      }

      if (b.vendedor_nome) {
        if (!resumo.porVendedor[b.vendedor_nome]) {
          resumo.porVendedor[b.vendedor_nome] = { quantidade: 0, valor: 0 };
        }
        resumo.porVendedor[b.vendedor_nome].quantidade++;
        resumo.porVendedor[b.vendedor_nome].valor += parseFloat(b.valor) || 0;
      }
    });

    res.json(resumo);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// ============================================
// SETUP INICIAL
// ============================================

app.post('/api/setup', async (req, res) => {
  try {
    const existing = await nocodbRequest('GET', `/tables/${TABLE_USUARIOS_ID}/records?limit=1`);

    if (existing.list && existing.list.length > 0) {
      return res.status(400).json({ error: 'Setup já realizado' });
    }

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = {
      nome,
      email: email.toLowerCase().trim(),
      senha: senhaHash,
      role: ROLES.ADMIN,
      ativo: true
    };

    const data = await nocodbRequest('POST', `/tables/${TABLE_USUARIOS_ID}/records`, admin);

    res.status(201).json({
      message: 'Administrador criado com sucesso',
      usuario: { id: data.Id, nome: data.nome, email: data.email, role: data.role }
    });
  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({ error: 'Erro ao criar administrador' });
  }
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno' });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Servidor Proxy - Railway
============================
✅ Porta: ${PORT}
✅ JWT: Ativo (expira em ${JWT_EXPIRES_IN})
✅ Roles: admin, gerente, vendedor
✅ Origens: ${allowedOrigins.join(', ')}
  `);
});
