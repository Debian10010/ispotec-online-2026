import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>A carregar...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const rawRole = user?.tipo || user?.role || user?.perfil || 'estudante';
  const userTipo = String(rawRole).toLowerCase().trim();
  if (adminOnly && userTipo !== 'especialista' && userTipo !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
