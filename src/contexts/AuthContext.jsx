/**
 * Contexto de Autenticação
 * Gerencia estado do usuário logado em toda a aplicação
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getUsuarioAtual,
  getStoredUser,
  isAuthenticated,
  getToken
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar token ao carregar
  useEffect(() => {
    async function verificarAuth() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const user = await getUsuarioAtual();
        setUsuario(user);
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    }

    verificarAuth();
  }, []);

  const login = useCallback(async (email, senha) => {
    setError(null);
    try {
      const user = await apiLogin(email, senha);
      setUsuario(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUsuario(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helpers de permissão
  const isAdmin = usuario?.role === 'admin';
  const isGerente = usuario?.role === 'gerente';
  const isVendedor = usuario?.role === 'vendedor';
  const canManageUsers = isAdmin;
  const canViewReports = isAdmin || isGerente;
  const canEditAllBoloes = isAdmin || isGerente;
  const canDeleteBoloes = isAdmin || isGerente;

  const value = {
    usuario,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!usuario,
    isAdmin,
    isGerente,
    isVendedor,
    canManageUsers,
    canViewReports,
    canEditAllBoloes,
    canDeleteBoloes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;
