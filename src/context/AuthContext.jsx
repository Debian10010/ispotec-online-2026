import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.sucesso && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateCurrentUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    authService.setCurrentUser(updated);
    setUser(updated);
  };

  const isAuthenticated = !!user;
  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');

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
        isAdmin
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
