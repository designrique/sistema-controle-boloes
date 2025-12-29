/**
 * Serviço de API - Frontend
 * Com Autenticação JWT
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('⚠️ VITE_API_URL não configurada!');
}

// ============================================
// GERENCIAMENTO DE TOKEN
// ============================================

const TOKEN_KEY = 'boloes_token';
const USER_KEY = 'boloes_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ============================================
// CLASSE DE ERRO
// ============================================

export class ApiError extends Error {
  constructor(message, status, errors = [], code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

// ============================================
// REQUISIÇÃO BASE
// ============================================

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      // Token expirado
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
        removeToken();
        window.location.href = '/login?expired=true';
        throw new ApiError('Sessão expirada', 401, [], 'TOKEN_EXPIRED');
      }

      throw new ApiError(
        data.error || 'Erro na requisição',
        response.status,
        data.errors || [],
        data.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Erro de conexão:', error);
    throw new ApiError('Erro de conexão com o servidor', 0);
  }
}

// ============================================
// AUTENTICAÇÃO
// ============================================

export async function login(email, senha) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  });

  setToken(data.token);
  setStoredUser(data.usuario);

  return data.usuario;
}

export async function logout() {
  removeToken();
}

export async function getUsuarioAtual() {
  return apiRequest('/auth/me');
}

export async function alterarSenha(senhaAtual, novaSenha) {
  return apiRequest('/auth/alterar-senha', {
    method: 'POST',
    body: JSON.stringify({ senhaAtual, novaSenha })
  });
}

export function isAuthenticated() {
  return !!getToken();
}

// ============================================
// USUÁRIOS
// ============================================

export async function listarUsuarios(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.ativo !== undefined) params.append('ativo', filtros.ativo);

  const query = params.toString();
  return apiRequest(`/usuarios${query ? `?${query}` : ''}`);
}

export async function criarUsuario(dados) {
  return apiRequest('/usuarios', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export async function atualizarUsuario(id, dados) {
  return apiRequest(`/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados)
  });
}

export async function deletarUsuario(id) {
  return apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
}

// ============================================
// BOLÕES
// ============================================

export async function listarBoloes({ status, search, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);

  const query = params.toString();
  return apiRequest(`/boloes${query ? `?${query}` : ''}`);
}

export async function buscarBolao(id) {
  return apiRequest(`/boloes/${id}`);
}

export async function criarBolao(dados) {
  return apiRequest('/boloes', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export async function atualizarBolao(id, dados) {
  return apiRequest(`/boloes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados)
  });
}

export async function deletarBolao(id) {
  return apiRequest(`/boloes/${id}`, { method: 'DELETE' });
}

// ============================================
// RELATÓRIOS
// ============================================

export async function getRelatorioResumo(dataInicio, dataFim) {
  const params = new URLSearchParams();
  if (dataInicio) params.append('dataInicio', dataInicio);
  if (dataFim) params.append('dataFim', dataFim);

  const query = params.toString();
  return apiRequest(`/relatorios/resumo${query ? `?${query}` : ''}`);
}

// ============================================
// SETUP
// ============================================

export async function setup(dados) {
  return apiRequest('/setup', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export async function verificarConexao() {
  return apiRequest('/health');
}
