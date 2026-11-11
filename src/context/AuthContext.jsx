import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos sem atividade

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // 30 min Inactivity auto-logout
  useEffect(() => {
    if (!user) return;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        console.warn('[AuthContext] Sessão expirada por inatividade de 30 minutos.');
        logout();
        window.location.href = '/auth/login?motivo=sessao_expirada';
      }
    }, 60 * 1000); // Verifica a cada 1 minuto

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [user, logout]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.sucesso && res.user) {
      setUser(res.user);
      lastActivityRef.current = Date.now();
    }
    return res;
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const updateCurrentUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    authService.setCurrentUser(updated);
    setUser(updated);
  };

  const isAuthenticated = !!user;
  const rawRole = user?.tipo || user?.role || user?.perfil || '';
  const userTipo = String(rawRole).toLowerCase().trim();
  const userEmail = String(user?.email || '').toLowerCase().trim();
  const isAdmin = Boolean(
    user && (
      userTipo === 'admin' ||
      userTipo === 'administrador' ||
      userTipo === 'especialista' ||
      userTipo === 'diretor' ||
      user?.is_admin === true ||
      user?.is_admin === 1 ||
      user?.isAdmin === true ||
      userEmail === 'admin@ispotec.online' ||
      userEmail === 'admin@ispotec.ac.mz' ||
      userEmail.includes('admin')
    )
  );
  const isDocente = !!user && userTipo === 'docente';
  const isSecretaria = !!user && (userTipo === 'secretaria' || userTipo === 'apoio');
  const isEstudante = !user || (!isAdmin && !isDocente && !isSecretaria);

  // Role permissions for modules
  const canAdd = isDocente || isAdmin;
  const canEdit = isDocente || isAdmin;
  const canDelete = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        isAuthenticated,
        isAdmin,
        isDocente,
        isSecretaria,
        isEstudante,
        canAdd,
        canEdit,
        canDelete
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
