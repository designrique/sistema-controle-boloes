/**
 * Página de Gerenciamento de Usuários
 * Apenas Admin tem acesso
 */

import { useState, useEffect } from 'react';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
  { value: 'gerente', label: 'Gerente', color: 'bg-blue-100 text-blue-800' },
  { value: 'vendedor', label: 'Vendedor', color: 'bg-green-100 text-green-800' }
];

function getRoleInfo(role) {
  return ROLES.find(r => r.value === role) || ROLES[2];
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');

  const { usuario: usuarioLogado } = useAuth();

  useEffect(() => {
    carregarUsuarios();
  }, [filtroAtivo]);

  async function carregarUsuarios() {
    setLoading(true);
    setError('');
    try {
      const filtros = {};
      if (filtroAtivo !== 'todos') {
        filtros.ativo = filtroAtivo === 'ativos';
      }
      const response = await listarUsuarios(filtros);
      setUsuarios(response.list || []);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleNovoUsuario() {
    setEditingUser(null);
    setShowModal(true);
  }

  function handleEditarUsuario(user) {
    setEditingUser(user);
    setShowModal(true);
  }

  async function handleDesativarUsuario(user) {
    if (user.id === usuarioLogado.id) {
      alert('Você não pode desativar seu próprio usuário');
      return;
    }

    if (!confirm(`Deseja realmente desativar o usuário "${user.nome}"?`)) {
      return;
    }

    try {
      await deletarUsuario(user.id);
      carregarUsuarios();
    } catch (err) {
      alert(err.message || 'Erro ao desativar usuário');
    }
  }

  async function handleReativarUsuario(user) {
    try {
      await atualizarUsuario(user.id, { ativo: true });
      carregarUsuarios();
    } catch (err) {
      alert(err.message || 'Erro ao reativar usuário');
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
          <p className="text-gray-600 mt-1">Cadastre e gerencie os usuários do sistema</p>
        </div>
        <Button variant="primary" onClick={handleNovoUsuario}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroAtivo('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroAtivo === 'todos'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroAtivo('ativos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroAtivo === 'ativos'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFiltroAtivo('inativos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroAtivo === 'inativos'
                ? 'bg-danger text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inativos
          </button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Lista de Usuários */
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const isCurrentUser = user.id === usuarioLogado.id;

                    return (
                      <tr key={user.id} className={!user.ativo ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.nome?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {user.nome}
                                {isCurrentUser && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                    Você
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.ativo ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.ultimo_acesso
                            ? new Date(user.ultimo_acesso).toLocaleString('pt-BR')
                            : 'Nunca acessou'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditarUsuario(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {!isCurrentUser && (
                              user.ativo ? (
                                <button
                                  onClick={() => handleDesativarUsuario(user)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Desativar"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReativarUsuario(user)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Reativar"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <UsuarioModal
          usuario={editingUser}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            carregarUsuarios();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// MODAL DE USUÁRIO
// ============================================

function UsuarioModal({ usuario, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    senha: '',
    role: usuario?.role || 'vendedor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!usuario;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dados = { ...formData };

      // Não enviar senha vazia em edição
      if (isEditing && !dados.senha) {
        delete dados.senha;
      }

      if (isEditing) {
        await atualizarUsuario(usuario.id, dados);
      } else {
        await criarUsuario(dados);
      }

      onSave();
    } catch (err) {
      setError(err.errors?.join(', ') || err.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha {isEditing && <span className="text-gray-400">(deixe em branco para manter)</span>}
              </label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required={!isEditing}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isEditing ? '••••••••' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Permissões */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Permissões do cargo:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {formData.role === 'admin' && (
                  <>
                    <li>✓ Gerenciar usuários</li>
                    <li>✓ Ver relatórios</li>
                    <li>✓ Gerenciar todos os bolões</li>
                  </>
                )}
                {formData.role === 'gerente' && (
                  <>
                    <li>✓ Ver usuários</li>
                    <li>✓ Ver relatórios</li>
                    <li>✓ Gerenciar todos os bolões</li>
                  </>
                )}
                {formData.role === 'vendedor' && (
                  <>
                    <li>✓ Criar bolões</li>
                    <li>✓ Editar próprios bolões</li>
                    <li>✗ Ver relatórios</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
